import type { License } from "@repo/payload/payload-types"
import { describe, expect, it } from "vitest"
import { ruleSetKeyFor } from "./rule-set-key"

const license = (overrides: Partial<License> = {}): License =>
  ({
    id: "license-1",
    practitioner: "user-1",
    state: "CA",
    licenseType: "LCSW",
    status: "active",
    licenseNumber: "LCSW-123",
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiresAt: "2026-01-01T00:00:00.000Z",
    renewalCycleMonths: 24,
    updatedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-02T00:00:00.000Z",
    ...overrides,
  }) as License

describe("ruleSetKeyFor", () => {
  it("resolves a shipped state + license type to its rule set key", () => {
    expect(ruleSetKeyFor(license())).toBe("CA-LCSW")
  })

  it("returns null when no rule set ships for the pair", () => {
    expect(ruleSetKeyFor(license({ state: "CA", licenseType: "LICSW" }))).toBe(
      null
    )
  })
})
