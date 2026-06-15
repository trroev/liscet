import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const find = vi.fn()
const put = vi.fn()
const sendEmail = vi.fn()
const payloadAuth = vi.fn(async () => ({ user: null }))

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadAuth,
    find,
  })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))

vi.mock("@vercel/blob", () => ({ put }))

vi.mock("@repo/emails/send", () => ({ sendEmail }))

vi.mock("@repo/env/app", () => ({
  env: { BASE_URL: "https://liscet.test" },
}))

vi.mock("@repo/env/auth", () => ({
  env: { BETTER_AUTH_SECRET: "test-secret" },
}))

vi.mock("@repo/env/blob", () => ({
  env: { BLOB_READ_WRITE_TOKEN: "blob-token" },
}))

describe("requestDataExport", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    put.mockReset()
    sendEmail.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("should reject unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { requestDataExport } = await import("./request-data-export")

    const result = await requestDataExport()

    expect(result).toEqual({
      code: "UNAUTHENTICATED",
      status: "error",
      message: "You must be signed in.",
    })
    expect(put).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("should upload a private blob and email a signed download link", async () => {
    getSession.mockResolvedValueOnce({
      user: { id: "ba-user-1", email: "u@e.co" },
    })
    find.mockImplementation(({ collection }: { collection: string }) => {
      if (collection === "users") {
        return Promise.resolve({
          docs: [{ id: "payload-user-1", email: "u@e.co" }],
        })
      }
      return Promise.resolve({ docs: [] })
    })
    put.mockResolvedValueOnce({
      pathname: "data-exports/payload-user-1-abc123.json",
      url: "https://blob.example/data-exports/payload-user-1-abc123.json",
    })
    sendEmail.mockResolvedValueOnce({ data: { id: "email-1" }, error: null })
    const { requestDataExport } = await import("./request-data-export")

    const result = await requestDataExport()

    expect(result).toEqual({ status: "success", data: undefined })
    expect(put).toHaveBeenCalledTimes(1)
    const [pathname, , putOptions] = put.mock.calls[0] as [
      string,
      string,
      {
        access: string
        addRandomSuffix: boolean
        contentType: string
        token: string
      },
    ]
    expect(pathname).toBe("data-exports/payload-user-1.json")
    expect(putOptions).toEqual({
      access: "private",
      addRandomSuffix: true,
      contentType: "application/json",
      token: "blob-token",
    })

    expect(sendEmail).toHaveBeenCalledTimes(1)
    const [emailArgs] = sendEmail.mock.calls[0] as [
      { subject: string; to: string },
    ]
    expect(emailArgs.to).toBe("u@e.co")
    expect(emailArgs.subject).toBe("Your Liscet data export")
  })
})
