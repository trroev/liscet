import { beforeEach, describe, expect, it, vi } from "vitest"

const find = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

describe("getLicensesData", () => {
  beforeEach(() => {
    vi.resetModules()
    find.mockReset()
  })

  it("queries every license for the practitioner, soonest-expiring first", async () => {
    find.mockResolvedValueOnce({ docs: [] })
    const { getLicensesData } = await import("./get-licenses-data")
    await getLicensesData("user-1")
    expect(find).toHaveBeenCalledWith({
      collection: "licenses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      sort: "expiresAt",
      where: { practitioner: { equals: "user-1" } },
    })
  })

  it("maps docs to views and defaults a missing renewal cycle to 24", async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          expiresAt: "2027-03-01T00:00:00.000Z",
          id: "license-1",
          issuedAt: "2025-03-01T00:00:00.000Z",
          licenseNumber: "ABC-123",
          licenseType: "LCSW",
          renewalCycleMonths: null,
          state: "CA",
          status: "active",
        },
      ],
    })
    const { getLicensesData } = await import("./get-licenses-data")
    const { licenses } = await getLicensesData("user-1")
    expect(licenses).toHaveLength(1)
    expect(licenses[0]?.renewalCycleMonths).toBe(24)
    expect(licenses[0]?.state).toBe("CA")
  })
})
