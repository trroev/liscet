import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const createMediaAsset = vi.fn()
const create = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

vi.mock("~/lib/queries/media", () => ({ createMediaAsset }))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ create })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

const { logCourse } = await import("./log-course")

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

const stubViewer = (id = "user-1"): void => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

const validFormData = (): FormData => {
  const formData = new FormData()
  formData.set("title", "Ethics 101")
  formData.set("provider", "State Board")
  formData.set("completedAt", "2024-01-15")
  formData.set("hours", "2")
  formData.set("format", "live")
  formData.append("subjectCategories", "Ethics")
  formData.append("subjectCategories", "Boundaries")
  return formData
}

describe("logCourse", () => {
  beforeEach(() => {
    getCurrentViewer.mockReset()
    createMediaAsset.mockReset()
    create.mockReset()
    create.mockResolvedValue({ id: "course-1" })
  })

  it("rejects unauthenticated requests", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const result = await logCourse(validFormData())
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(create).not.toHaveBeenCalled()
  })

  it("creates a course owned by the viewer with source manual", async () => {
    stubViewer("practitioner-9")
    const result = await logCourse(validFormData())

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "courses",
        data: expect.objectContaining({
          completedAt: "2024-01-15",
          format: "live",
          hours: 2,
          practitioner: "practitioner-9",
          provider: "State Board",
          source: "manual",
          subjectCategories: ["Ethics", "Boundaries"],
          title: "Ethics 101",
        }),
        overrideAccess: true,
      })
    )
    expect(createMediaAsset).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: "success",
      data: { courseId: "course-1" },
    })
  })

  it("uploads a certificate and links it to the course", async () => {
    stubViewer()
    createMediaAsset.mockResolvedValueOnce({ id: "media-1", url: null })
    const formData = validFormData()
    formData.set("certificate", makeFile("cert.pdf", "application/pdf", 2048))

    await logCourse(formData)

    expect(createMediaAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: "Ethics 101 certificate",
        file: expect.any(File),
      })
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ certificate: "media-1" }),
      })
    )
  })

  it("rejects a disallowed certificate mime type without creating a course", async () => {
    stubViewer()
    const formData = validFormData()
    formData.set("certificate", makeFile("cert.gif", "image/gif", 2048))

    const result = await logCourse(formData)

    expect(result.status).toBe("error")
    expect(createMediaAsset).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects an oversize certificate without creating a course", async () => {
    stubViewer()
    const formData = validFormData()
    formData.set(
      "certificate",
      makeFile("cert.pdf", "application/pdf", 11 * 1024 * 1024)
    )

    const result = await logCourse(formData)

    expect(result).toEqual({
      status: "error",
      message: "Certificate must be under 10 MB.",
    })
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects invalid scalar input without creating a course", async () => {
    stubViewer()
    const formData = validFormData()
    formData.set("title", "")

    const result = await logCourse(formData)

    expect(result.status).toBe("error")
    expect(create).not.toHaveBeenCalled()
  })
})
