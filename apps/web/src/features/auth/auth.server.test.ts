import { beforeEach, describe, expect, it, vi } from "vitest"

const create = vi.fn()
const update = vi.fn()
const find = vi.fn()
const deleteDoc = vi.fn()
const captureException = vi.fn()
const getPayloadUserByBetterAuthId = vi.fn()
const createAuth = vi.fn(
  (options: Record<string, unknown>): Record<string, unknown> => options
)

vi.mock("server-only", () => ({}))
vi.mock("@payload-config", () => ({ default: {} }))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ create, update, find, delete: deleteDoc })),
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

vi.mock("~/lib/queries/payload-user-by-better-auth-id", () => ({
  getPayloadUserByBetterAuthId,
}))

vi.mock("@repo/auth", () => ({ createAuth }))

type SyncHooks = {
  user: {
    create: { after: (user: unknown) => Promise<void> }
    update: { after: (user: unknown) => Promise<void> }
    delete: { after: (user: unknown) => Promise<void> }
  }
}

const loadHooks = async (): Promise<SyncHooks> => {
  const { auth } = await import("./auth.server")
  return (auth as unknown as { databaseHooks: SyncHooks }).databaseHooks
}

const googleUser = {
  id: "ba-user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  image: "https://lh3.googleusercontent.com/a/ada",
}

const passwordUser = {
  id: "ba-user-2",
  name: "Grace Hopper",
  email: "grace@example.com",
}

describe("auth.server sync hooks", () => {
  beforeEach(() => {
    vi.resetModules()
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
        data: {
          betterAuthId: "ba-user-1",
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          imageUrl: "https://lh3.googleusercontent.com/a/ada",
        },
      })
    })

    it("should create a new practitioner without an imageUrl for password sign-up", async () => {
      find.mockResolvedValueOnce({ docs: [] })
      const hooks = await loadHooks()

      await hooks.user.create.after(passwordUser)

      expect(create).toHaveBeenCalledWith({
        collection: "users",
        data: {
          betterAuthId: "ba-user-2",
          displayName: "Grace Hopper",
          email: "grace@example.com",
        },
      })
    })

    it("should link an existing email-matched user by betterAuthId only", async () => {
      find.mockResolvedValueOnce({ docs: [{ id: "payload-user-1" }] })
      const hooks = await loadHooks()

      await hooks.user.create.after(googleUser)

      expect(create).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-1",
        data: { betterAuthId: "ba-user-1" },
      })
    })
  })

  describe("update.after", () => {
    it("should refresh the avatar url on the linked practitioner", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce({
        id: "payload-user-1",
      })
      const hooks = await loadHooks()

      await hooks.user.update.after(googleUser)

      expect(update).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-1",
        data: {
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          imageUrl: "https://lh3.googleusercontent.com/a/ada",
        },
      })
    })

    it("should leave imageUrl untouched when the user has no image", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce({
        id: "payload-user-2",
      })
      const hooks = await loadHooks()

      await hooks.user.update.after(passwordUser)

      expect(update).toHaveBeenCalledWith({
        collection: "users",
        id: "payload-user-2",
        data: {
          displayName: "Grace Hopper",
          email: "grace@example.com",
        },
      })
    })

    it("should create the practitioner when no linked user exists yet", async () => {
      getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)
      const hooks = await loadHooks()

      await hooks.user.update.after(googleUser)

      expect(update).not.toHaveBeenCalled()
      expect(create).toHaveBeenCalledWith({
        collection: "users",
        data: {
          betterAuthId: "ba-user-1",
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          imageUrl: "https://lh3.googleusercontent.com/a/ada",
        },
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
