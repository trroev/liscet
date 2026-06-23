import { beforeEach, describe, expect, it, vi } from "vitest"

const viewer = vi.fn()
const certificateFor = vi.fn()
const practitionerData = vi.fn(() => ({ certificateFor }))
const presignCertificateUrl = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({})),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/queries/current-viewer", () => ({ viewer }))

vi.mock("@repo/payload/queries/practitioner-data", () => ({ practitionerData }))

vi.mock("../lib/certificate-blob", () => ({ presignCertificateUrl }))

const stubViewer = (userId = "user-1"): void => {
  viewer.mockResolvedValueOnce({
    session: { id: userId },
    user: { id: userId },
  })
}

describe("getCertificateUrl", () => {
  beforeEach(() => {
    vi.resetModules()
    viewer.mockReset()
    certificateFor.mockReset()
    presignCertificateUrl.mockReset()
  })

  it("rejects unauthenticated requests", async () => {
    viewer.mockResolvedValueOnce(null)
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result.status).toBe("error")
    expect(certificateFor).not.toHaveBeenCalled()
  })

  it("resolves the certificate as the signed-in practitioner", async () => {
    stubViewer("user-1")
    certificateFor.mockResolvedValueOnce({ status: "not-found" })
    const { getCertificateUrl } = await import("./get-certificate-url")

    await getCertificateUrl("course-1")

    expect(practitionerData).toHaveBeenCalledWith(
      expect.objectContaining({ practitionerId: "user-1" })
    )
    expect(certificateFor).toHaveBeenCalledWith("course-1")
  })

  it("reports a not-found certificate without presigning", async () => {
    stubViewer("user-1")
    certificateFor.mockResolvedValueOnce({ status: "not-found" })
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result).toMatchObject({
      message: "Certificate not found.",
      status: "error",
    })
    expect(presignCertificateUrl).not.toHaveBeenCalled()
  })

  it("reports a course with no certificate", async () => {
    stubViewer("user-1")
    certificateFor.mockResolvedValueOnce({ status: "no-certificate" })
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result).toMatchObject({
      message: "This course has no certificate.",
      status: "error",
    })
    expect(presignCertificateUrl).not.toHaveBeenCalled()
  })

  it("presigns and returns a URL for a resolved certificate", async () => {
    stubViewer("user-1")
    certificateFor.mockResolvedValueOnce({
      blobPathname: "media/cert-abc.pdf",
      status: "ok",
    })
    presignCertificateUrl.mockResolvedValueOnce(
      "https://store.blob.vercel-storage.com/media/cert-abc.pdf?signed=1"
    )
    const { getCertificateUrl } = await import("./get-certificate-url")

    const result = await getCertificateUrl("course-1")

    expect(result.status).toBe("success")
    if (result.status === "success") {
      expect(result.data.url).toContain("signed=1")
    }
    expect(presignCertificateUrl).toHaveBeenCalledWith({
      pathname: "media/cert-abc.pdf",
    })
  })
})
