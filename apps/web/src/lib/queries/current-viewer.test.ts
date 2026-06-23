import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const getPayloadUserByBetterAuthId = vi.fn()
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`)
})

vi.mock("server-only", () => ({}))
vi.mock("react", () => ({ cache: <T>(fn: T): T => fn }))
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock("next/navigation", () => ({ redirect }))
vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))
vi.mock("~/lib/queries/payload-user-by-better-auth-id", () => ({
  getPayloadUserByBetterAuthId,
}))

const { requireViewer, viewer } = await import("./current-viewer")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("viewer", () => {
  it("returns null when there is no session", async () => {
    getSession.mockResolvedValueOnce(null)

    expect(await viewer()).toBeNull()
    expect(getPayloadUserByBetterAuthId).not.toHaveBeenCalled()
  })

  it("pairs the session user with the linked Payload user", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "a@b.co", id: "ba-1" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce({ id: "u-1" })

    expect(await viewer()).toEqual({
      session: { email: "a@b.co", id: "ba-1" },
      user: { id: "u-1" },
    })
    expect(getPayloadUserByBetterAuthId).toHaveBeenCalledWith("ba-1")
  })

  it("returns a null user when the session has no linked Payload user", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "c@d.co", id: "ba-2" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)

    expect(await viewer()).toEqual({
      session: { email: "c@d.co", id: "ba-2" },
      user: null,
    })
  })
})

describe("requireViewer", () => {
  it("redirects to /sign-in when there is no session", async () => {
    getSession.mockResolvedValueOnce(null)

    await expect(requireViewer()).rejects.toThrow("REDIRECT:/sign-in")
  })

  it("redirects to /sign-in with a callbackUrl when provided", async () => {
    getSession.mockResolvedValueOnce(null)

    await expect(requireViewer({ callbackUrl: "/profile" })).rejects.toThrow(
      "REDIRECT:/sign-in?callbackUrl=/profile"
    )
  })

  it("redirects to /sign-in when the session has no Payload user", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "e@f.co", id: "ba-3" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce(null)

    await expect(requireViewer()).rejects.toThrow("REDIRECT:/sign-in")
  })

  it("returns the authed viewer when onboarding is not required", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "g@h.co", id: "ba-4" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce({
      id: "u-4",
      slug: null,
    })

    expect(await requireViewer()).toEqual({
      session: { email: "g@h.co", id: "ba-4" },
      user: { id: "u-4", slug: null },
    })
  })

  it("redirects to /onboarding when onboarded is required but the slug is missing", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "i@j.co", id: "ba-5" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce({
      id: "u-5",
      slug: null,
    })

    await expect(requireViewer({ onboarded: true })).rejects.toThrow(
      "REDIRECT:/onboarding"
    )
  })

  it("returns the onboarded viewer with its slug", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "k@l.co", id: "ba-6" } })
    getPayloadUserByBetterAuthId.mockResolvedValueOnce({
      id: "u-6",
      slug: "kael",
    })

    expect(await requireViewer({ onboarded: true })).toEqual({
      session: { email: "k@l.co", id: "ba-6" },
      slug: "kael",
      user: { id: "u-6", slug: "kael" },
    })
  })
})
