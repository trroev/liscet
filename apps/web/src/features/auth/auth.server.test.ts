import { beforeEach, describe, expect, it, vi } from "vitest"

type SyncHook = { after: (user: unknown) => Promise<void> }

type SyncHooks = {
  user: { create: SyncHook; update: SyncHook; delete: SyncHook }
}

type CapturedAuthOptions = { databaseHooks: SyncHooks }

const create = vi.fn()
const update = vi.fn()
const find = vi.fn()
const deleteDoc = vi.fn()
const captureException = vi.fn()
const getPayloadUserByBetterAuthId = vi.fn()

let capturedOptions: CapturedAuthOptions | undefined
const createAuth = vi.fn(
  (options: CapturedAuthOptions): CapturedAuthOptions => {
    capturedOptions = options
    return options
  }
)

vi.mock("server-only", () => ({}))
vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ create, update, find, delete: deleteDoc })),
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

vi.mock("~/lib/queries/payload-user-by-better-auth-id", () => ({
  getPayloadUserByBetterAuthId,
}))

vi.mock("@repo/auth", () => ({ createAuth }))

const loadHooks = async (): Promise<SyncHooks> => {
  await import("./auth.server")
  if (!capturedOptions) {
    throw new Error("createAuth was not invoked by auth.server")
  }
  return capturedOptions.databaseHooks
}

const googleUser = {
  id: "ba-user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  image: "https://lh3.googleusercontent.com/a/ada",
}

const syncedProfile = {
  displayName: "Ada Lovelace",
  email: "ada@example.com",
  imageUrl: "https://lh3.googleusercontent.com/a/ada",
}

describe("auth.server sync hooks", () => {
  beforeEach(() => {
    vi.resetModules()
    capturedOptions = undefined
    create.mockReset()
    update.mockReset()
    find.mockReset()
    deleteDoc.mockReset()
    captureException.mockReset()
    getPayloadUserByBetterAuthId.mockReset()
  })

  describe("create.after", () => {
    it("should create a new practitioner carrying the Google avatar url", async () => {
      find.mockResolvedValueOnce({ docs: [] })
      const hooks = await loadHooks()

      await hooks.user.create.after(googleUser)

      expect(create).toHaveBeenCalledWith({
        collection: "users",
        data: { betterAuthId: "ba-user-1", ...syncedProfile },
      })
    })

    it("should link an email-matched practitioner and carry the avatar url", async () => {
      find.mockResolvedValueOnce({ docs: [{ id: "payload-user-1" }] })
      const hooks = await loadHooks()

      await hooks.user.create.after(googleUser)

      expect(create).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-1",
        data: { betterAuthId: "ba-user-1", ...syncedProfile },
      })
    })
  })

  describe("update.after", () => {
    it("should refresh the profile on the linked practitioner", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce({
        id: "payload-user-1",
      })
      const hooks = await loadHooks()

      await hooks.user.update.after(googleUser)

      expect(update).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-1",
        data: syncedProfile,
      })
    })

    it("should create the practitioner when no linked user exists yet", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)
      const hooks = await loadHooks()

      await hooks.user.update.after(googleUser)

      expect(update).not.toHaveBeenCalled()
      expect(create).toHaveBeenCalledWith({
        collection: "users",
        data: { betterAuthId: "ba-user-1", ...syncedProfile },
      })
    })
  })

  describe("delete.after", () => {
    it("should delete the linked practitioner doc", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce({
        id: "payload-user-1",
      })
      const hooks = await loadHooks()

      await hooks.user.delete.after(googleUser)

      expect(deleteDoc).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-1",
      })
    })

    it("should be a no-op when there is no linked practitioner", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)
      const hooks = await loadHooks()

      await hooks.user.delete.after(googleUser)

      expect(deleteDoc).not.toHaveBeenCalled()
    })
  })

  it("should report a sync failure to Sentry without rethrowing", async () => {
    find.mockResolvedValueOnce({ docs: [] })
    const failure = new Error("payload down")
    create.mockRejectedValueOnce(failure)
    const hooks = await loadHooks()

    await expect(hooks.user.create.after(googleUser)).resolves.toBeUndefined()
    expect(captureException).toHaveBeenCalledWith(failure)
  })
})
