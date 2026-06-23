import { beforeEach, describe, expect, it, vi } from "vitest"

const viewer = vi.fn()
const warn = vi.fn()
const withMetadata = vi.fn(() => ({ warn }))

vi.mock("server-only", () => ({}))
vi.mock("~/features/auth/actions/sign-out", () => ({ signOutAction: vi.fn() }))
vi.mock("~/lib/queries/current-viewer", () => ({ viewer }))
vi.mock("@repo/logger", () => ({
  createLogger: () => ({ withMetadata }),
}))

const { resolveHeaderAuth } = await import("./header-auth")

const stubViewer = (
  session: { id: string; name?: string; email: string },
  user: { avatar?: unknown } | null
): void => {
  viewer.mockResolvedValueOnce({ session, user })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("resolveHeaderAuth", () => {
  it("returns anonymous when no viewer exists", async () => {
    viewer.mockResolvedValueOnce(null)

    const result = await resolveHeaderAuth()

    expect(result).toEqual({ status: "anonymous" })
  })

  it("returns signed-in using the session name and the Payload user's avatar", async () => {
    stubViewer(
      { email: "ada@example.com", id: "ba-1", name: "Ada Lovelace" },
      { avatar: { url: "https://cdn.example.com/ada.png" } }
    )

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
    stubViewer(
      { email: "grace@example.com", id: "ba-2", name: "Grace Hopper" },
      null
    )

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
    stubViewer({ email: "linus@example.com", id: "ba-3" }, null)

    const result = await resolveHeaderAuth()

    expect(result).toMatchObject({
      displayName: "linus@example.com",
      status: "signed-in",
    })
  })
})
