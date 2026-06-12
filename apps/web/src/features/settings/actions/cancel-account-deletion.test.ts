import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const find = vi.fn()
const update = vi.fn()
const revalidatePath = vi.fn()
const payloadAuth = vi.fn(async () => ({ user: null }))

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock("next/cache", () => ({
  revalidatePath,
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadAuth,
    find,
    update,
  })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))

describe("cancelAccountDeletion", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    revalidatePath.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("should reject unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { cancelAccountDeletion } = await import("./cancel-account-deletion")

    const result = await cancelAccountDeletion()

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(update).not.toHaveBeenCalled()
  })

  it("should clear deletedAt for the signed-in user", async () => {
    getSession.mockResolvedValueOnce({
      user: { id: "ba-user-1", email: "u@e.co" },
    })
    find.mockResolvedValueOnce({
      docs: [{ id: "payload-user-1", slug: "test-user" }],
    })
    const { cancelAccountDeletion } = await import("./cancel-account-deletion")

    const result = await cancelAccountDeletion()

    expect(result).toEqual({ status: "success", data: undefined })
    expect(update).toHaveBeenCalledWith({
      collection: "users",
      id: "payload-user-1",
      data: { deletedAt: null },
      overrideAccess: true,
    })
    expect(revalidatePath).toHaveBeenCalledWith("/test-user/settings/account")
  })
})
