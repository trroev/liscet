import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const findByID = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findByID })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

vi.mock("@repo/env/app", () => ({
  env: { BASE_URL: "https://app.test" },
}))

vi.mock("@repo/env/auth", () => ({
  env: { BETTER_AUTH_SECRET: "test-secret" },
}))

const stubViewer = (userId = "user-1"): void => {
  getCurrentViewer.mockResolvedValueOnce({
    kind: "user",
    user: { id: userId },
  })
}

describe("getCertificateUrl", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    findByID.mockReset()
  })

  it("rejects unauthenticated requests", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result.status).toBe("error")
    expect(findByID).not.toHaveBeenCalled()
  })

  it("rejects a course owned by another practitioner", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({
      certificate: "media-1",
      id: "course-1",
      practitioner: "user-2",
    })
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result).toMatchObject({
      message: "Certificate not found.",
      status: "error",
    })
  })

  it("rejects a course with no certificate", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({
      certificate: null,
      id: "course-1",
      practitioner: "user-1",
    })
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result).toMatchObject({
      message: "This course has no certificate.",
      status: "error",
    })
  })

  it("returns a signed download URL for an owned course with a certificate", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({
      certificate: "media-1",
      id: "course-1",
      practitioner: "user-1",
    })
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result.status).toBe("success")
    if (result.status === "success") {
      const url = new URL(result.data.url)
      expect(url.origin).toBe("https://app.test")
      expect(url.pathname).toBe("/api/courses/certificate")
      expect(url.searchParams.get("token")).toBeTruthy()
    }
  })
})
