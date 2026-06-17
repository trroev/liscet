import { describe, expect, it } from "vitest"
import { fileIntake } from "./file-intake"

const makeFile = (
  name: string,
  type: string,
  bytes: number,
  contents: BlobPart = "x"
): File => {
  const file = new File([contents], name, { type })
  Object.defineProperty(file, "size", { value: bytes })
  return file
}

const certificateSchema = fileIntake({
  maxBytes: 10 * 1024 * 1024,
  mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  label: "certificate",
})

const avatarSchema = fileIntake({
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  label: "avatar",
})

const firstError = (result: {
  error?: { issues: ReadonlyArray<{ message: string }> }
}) => result.error?.issues[0]?.message

describe("fileIntake", () => {
  it("accepts a file within the size limit and allowlist", () => {
    const result = certificateSchema.safeParse(
      makeFile("cert.pdf", "application/pdf", 2048)
    )
    expect(result.success).toBe(true)
  })

  it("rejects non-file inputs with a label-interpolated message", () => {
    const result = avatarSchema.safeParse("not a file")
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe("Provide a valid avatar image.")
  })

  it("rejects empty files", () => {
    const result = avatarSchema.safeParse(makeFile("empty.png", "image/png", 0))
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe("Provide a valid avatar image.")
  })

  it("rejects oversized files with the configured ceiling", () => {
    const result = avatarSchema.safeParse(
      makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024)
    )
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe("Avatar must be under 5 MB.")
  })

  it("rejects disallowed mime types", () => {
    const result = avatarSchema.safeParse(
      makeFile("evil.gif", "image/gif", 1024)
    )
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe(
      "Avatar must be a JPEG, PNG, or WebP image."
    )
  })

  it("derives a 'file' noun and pdf-inclusive list when not image-only", () => {
    const result = certificateSchema.safeParse(
      makeFile("evil.gif", "image/gif", 1024)
    )
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe(
      "Certificate must be a PDF, JPEG, PNG, or WebP file."
    )
  })

  it("interpolates the configured ceiling for the certificate label", () => {
    const result = certificateSchema.safeParse(
      makeFile("big.pdf", "application/pdf", 11 * 1024 * 1024)
    )
    expect(result.success).toBe(false)
    expect(firstError(result)).toBe("Certificate must be under 10 MB.")
  })
})
