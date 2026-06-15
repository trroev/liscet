import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UpdateLicenseInput } from "./update-license"

const getCurrentViewer = vi.fn()
const findByID = vi.fn()
const update = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findByID, update })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

const stubViewer = (userId = "user-1"): void => {
  getCurrentViewer.mockResolvedValueOnce({
    kind: "user",
    user: { id: userId },
  })
}

const validInput: UpdateLicenseInput = {
  expiresAt: "2028-01-01",
  licenseId: "license-1",
  renewalCycleMonths: 24,
}

describe("updateLicense", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    findByID.mockReset()
    update.mockReset()
  })

  it("rejects unauthenticated requests", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense(validInput)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("UNAUTHENTICATED")
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("rejects an unsupported renewal cycle", async () => {
    stubViewer()
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense({
      ...validInput,
      renewalCycleMonths: 18,
    })
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("INVALID_INPUT")
    }
    expect(findByID).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("refuses to edit a license owned by another practitioner", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({ id: "license-1", practitioner: "user-2" })
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense(validInput)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("NOT_FOUND")
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("returns NOT_FOUND when the license does not exist", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce(null)
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense(validInput)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("NOT_FOUND")
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("updates expiresAt and renewalCycleMonths for the owner", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({ id: "license-1", practitioner: "user-1" })
    update.mockResolvedValueOnce({
      expiresAt: "2028-01-01T00:00:00.000Z",
      id: "license-1",
      issuedAt: "2026-01-01T00:00:00.000Z",
      licenseNumber: "ABC-123",
      licenseType: "LCSW",
      renewalCycleMonths: 24,
      state: "CA",
      status: "active",
    })
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense(validInput)
    expect(result.status).toBe("success")
    if (result.status === "success") {
      expect(result.data.id).toBe("license-1")
      expect(result.data.renewalCycleMonths).toBe(24)
    }
    expect(update).toHaveBeenCalledWith({
      collection: "licenses",
      data: { expiresAt: "2028-01-01", renewalCycleMonths: 24 },
      id: "license-1",
      overrideAccess: true,
    })
  })

  it("resolves ownership when the practitioner ref is populated", async () => {
    stubViewer("user-1")
    findByID.mockResolvedValueOnce({
      id: "license-1",
      practitioner: { id: "user-1" },
    })
    update.mockResolvedValueOnce({
      expiresAt: "2028-01-01T00:00:00.000Z",
      id: "license-1",
      issuedAt: "2026-01-01T00:00:00.000Z",
      licenseNumber: "ABC-123",
      licenseType: "LCSW",
      renewalCycleMonths: 24,
      state: "CA",
      status: "active",
    })
    const { updateLicense } = await import("./update-license")
    const result = await updateLicense(validInput)
    expect(result.status).toBe("success")
  })
})
