import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const getPayloadUserByBetterAuthId = vi.fn()
const warn = vi.fn()
const withMetadata = vi.fn(() => ({ warn }))

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))
vi.mock("~/features/auth/actions/sign-out", () => ({ signOutAction: vi.fn() }))
vi.mock("~/lib/queries/payload-user-by-better-auth-id", () => ({
  getPayloadUserByBetterAuthId,
}))
vi.mock("@repo/logger", () => ({
  createLogger: () => ({ withMetadata }),
}))

const { resolveHeaderAuth } = await import("./header-auth")

const stubSession = (user: { id: string; name?: string; email: string }) => {
  getSession.mockResolvedValueOnce({ user })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("resolveHeaderAuth", () => {
  it("returns anonymous when no session exists", async () => {
    getSession.mockResolvedValueOnce(null)

    const result = await resolveHeaderAuth()

    expect(result).toEqual({ status: "anonymous" })
    expect(getPayloadUserByBetterAuthId).not.toHaveBeenCalled()
  })

  it("returns signed-in using the session name and the Payload user's avatar", async () => {
    stubSession({ email: "ada@example.com", id: "ba-1", name: "Ada Lovelace" })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce({
      avatar: { url: "https://cdn.example.com/ada.png" },
    })

    const result = await resolveHeaderAuth()

    expect(result).toMatchObject({
      avatarUrl: "https://cdn.example.com/ada.png",
      displayName: "Ada Lovelace",
      initials: "AL",
      status: "signed-in",
    })
    expect(warn).not.toHaveBeenCalled()
  })

  it("stays signed-in with a null avatar and warns when no Payload user resolves", async () => {
    stubSession({
      email: "grace@example.com",
      id: "ba-2",
      name: "Grace Hopper",
    })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)

    const result = await resolveHeaderAuth()

    expect(result).toMatchObject({
      avatarUrl: null,
      displayName: "Grace Hopper",
      initials: "GH",
      status: "signed-in",
    })
    expect(withMetadata).toHaveBeenCalledWith({ betterAuthId: "ba-2" })
    expect(warn).toHaveBeenCalledOnce()
  })

  it("falls back to the session email for the display name", async () => {
    stubSession({ email: "linus@example.com", id: "ba-3" })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)

    const result = await resolveHeaderAuth()

    expect(result).toMatchObject({
      displayName: "linus@example.com",
      status: "signed-in",
    })
  })
})
