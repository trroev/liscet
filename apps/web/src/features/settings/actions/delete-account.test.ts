import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const find = vi.fn()
const update = vi.fn()
const findAccounts = vi.fn()
const verify = vi.fn()
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
  auth: {
    api: { getSession },
    $context: Promise.resolve({
      internalAdapter: { findAccounts },
      password: { verify },
    }),
  },
}))

const stubSession = (userId = "ba-user-1") => {
  getSession.mockResolvedValueOnce({
    user: { id: userId, email: "u@e.co" },
  })
}

const stubUserLookup = (
  docs: ReadonlyArray<{
    id: string
    betterAuthId?: string | null
    slug?: string | null
  }> = [{ id: "payload-user-1", betterAuthId: "ba-user-1", slug: "test-user" }]
) => {
  find.mockResolvedValueOnce({ docs })
}

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    findAccounts.mockReset()
    verify.mockReset()
    revalidatePath.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("should reject unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { deleteAccount } = await import("./delete-account")

    const result = await deleteAccount({ password: "hunter22" })

    expect(result).toEqual({
      code: "UNAUTHENTICATED",
      status: "error",
      message: "You must be signed in.",
    })
    expect(update).not.toHaveBeenCalled()
  })

  it("should reject an empty password without verifying", async () => {
    stubSession()
    stubUserLookup()
    const { deleteAccount } = await import("./delete-account")

    const result = await deleteAccount({ password: "" })

    expect(result).toEqual({
      code: "INVALID_INPUT",
      status: "error",
      message: "Password is required.",
    })
    expect(findAccounts).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("should reject when the user has no credential account", async () => {
    stubSession()
    stubUserLookup()
    findAccounts.mockResolvedValueOnce([
      { providerId: "github", password: null },
    ])
    const { deleteAccount } = await import("./delete-account")

    const result = await deleteAccount({ password: "hunter22" })

    expect(result).toEqual({
      status: "error",
      message: "Password sign-in is not configured for this account.",
    })
    expect(update).not.toHaveBeenCalled()
  })

  it("should reject an incorrect password without soft-deleting", async () => {
    stubSession()
    stubUserLookup()
    findAccounts.mockResolvedValueOnce([
      { providerId: "credential", password: "hashed" },
    ])
    verify.mockResolvedValueOnce(false)
    const { deleteAccount } = await import("./delete-account")

    const result = await deleteAccount({ password: "wrong" })

    expect(verify).toHaveBeenCalledWith({ hash: "hashed", password: "wrong" })
    expect(result).toEqual({ status: "error", message: "Incorrect password." })
    expect(update).not.toHaveBeenCalled()
  })

  it("should set deletedAt when the password is correct", async () => {
    stubSession()
    stubUserLookup()
    findAccounts.mockResolvedValueOnce([
      { providerId: "credential", password: "hashed" },
    ])
    verify.mockResolvedValueOnce(true)
    const { deleteAccount } = await import("./delete-account")

    const result = await deleteAccount({ password: "hunter22" })

    expect(result.status).toBe("success")
    expect(update).toHaveBeenCalledTimes(1)
    const [updateArgs] = update.mock.calls[0] as [
      { collection: string; id: string; data: { deletedAt: string } },
    ]
    expect(updateArgs.collection).toBe("users")
    expect(updateArgs.id).toBe("payload-user-1")
    expect(Date.parse(updateArgs.data.deletedAt)).not.toBeNaN()
    expect(revalidatePath).toHaveBeenCalledWith("/test-user/settings/account")
  })
})
