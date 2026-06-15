import { beforeEach, describe, expect, it, vi } from "vitest"

const { findByID, verifyCertificateToken } = vi.hoisted(() => ({
  findByID: vi.fn(),
  verifyCertificateToken: vi.fn(),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findByID })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/courses/lib/certificate-token", () => ({
  verifyCertificateToken,
}))

import { GET } from "./route"

const requestFor = (token?: string): Request => {
  const url = new URL("https://app.test/api/courses/certificate")
  if (token !== undefined) {
    url.searchParams.set("token", token)
  }
  return new Request(url)
}

describe("GET /api/courses/certificate", () => {
  beforeEach(() => {
    findByID.mockReset()
    verifyCertificateToken.mockReset()
    vi.restoreAllMocks()
  })

  it("returns 403 when no token is present", async () => {
    const response = await GET(requestFor())
    expect(response.status).toBe(403)
    expect(verifyCertificateToken).not.toHaveBeenCalled()
  })

  it("returns 403 when the token is invalid or expired", async () => {
    verifyCertificateToken.mockReturnValueOnce(null)
    const response = await GET(requestFor("bad-token"))
    expect(response.status).toBe(403)
  })

  it("returns 404 when the media is missing or has no url", async () => {
    verifyCertificateToken.mockReturnValueOnce({
      expiresAt: Date.now() + 1000,
      mediaId: "media-1",
    })
    findByID.mockResolvedValueOnce(null)
    const response = await GET(requestFor("good-token"))
    expect(response.status).toBe(404)
  })

  it("returns 404 when the upstream fetch fails", async () => {
    verifyCertificateToken.mockReturnValueOnce({
      expiresAt: Date.now() + 1000,
      mediaId: "media-1",
    })
    findByID.mockResolvedValueOnce({ url: "https://cdn.test/cert.pdf" })
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 502 })
    )
    const response = await GET(requestFor("good-token"))
    expect(response.status).toBe(404)
  })

  it("streams the certificate as an attachment on success", async () => {
    verifyCertificateToken.mockReturnValueOnce({
      expiresAt: Date.now() + 1000,
      mediaId: "media-1",
    })
    findByID.mockResolvedValueOnce({
      filename: "ethics.pdf",
      mimeType: "application/pdf",
      url: "https://cdn.test/cert.pdf",
    })
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("pdf-bytes", { status: 200 })
    )

    const response = await GET(requestFor("good-token"))

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("application/pdf")
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="ethics.pdf"'
    )
    expect(response.headers.get("cache-control")).toBe("no-store")
  })
})
