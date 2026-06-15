// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@repo/testing/render"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { getCertificateUrl } = vi.hoisted(() => ({
  getCertificateUrl: vi.fn(),
}))

vi.mock("../../actions/get-certificate-url", () => ({ getCertificateUrl }))

import { CertificateDownload } from "./certificate-download"

describe("CertificateDownload", () => {
  beforeEach(() => {
    getCertificateUrl.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("opens the signed URL in a new tab on success", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    getCertificateUrl.mockResolvedValueOnce({
      data: { url: "https://app.test/api/courses/certificate?token=abc" },
      status: "success",
    })
    const user = userEvent.setup()
    render(<CertificateDownload courseId="course-1" />)

    await user.click(screen.getByRole("button", { name: "View certificate" }))

    expect(getCertificateUrl).toHaveBeenCalledWith("course-1")
    expect(open).toHaveBeenCalledWith(
      "https://app.test/api/courses/certificate?token=abc",
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("surfaces an error message on failure", async () => {
    getCertificateUrl.mockResolvedValueOnce({
      message: "Certificate not found.",
      status: "error",
    })
    const user = userEvent.setup()
    render(<CertificateDownload courseId="course-1" />)

    await user.click(screen.getByRole("button", { name: "View certificate" }))

    expect(
      await screen.findByText("Certificate not found.")
    ).toBeInTheDocument()
  })
})
