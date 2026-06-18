// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { scanUploadedFile } from "./index"

vi.mock("@repo/env/scan", () => ({
  env: {
    VIRUS_SCAN_API_KEY: undefined,
    VIRUS_SCAN_URL: undefined,
  },
}))

vi.mock("@repo/observability", () => ({ captureException: vi.fn() }))

describe("scanUploadedFile gate", () => {
  it("skips the scan and passes the file when VIRUS_SCAN_URL is unset", async () => {
    const verdict = await scanUploadedFile({
      data: Buffer.from("file-bytes"),
      filename: "cert.pdf",
      mimetype: "application/pdf",
    })

    expect(verdict).toEqual({ clean: true })
  })
})
