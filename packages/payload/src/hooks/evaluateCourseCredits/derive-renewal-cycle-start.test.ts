import { describe, expect, it } from "vitest"
import { deriveRenewalCycleStart } from "./derive-renewal-cycle-start"

const EXPIRES_AT = "2026-06-15T12:00:00.000Z"

describe("deriveRenewalCycleStart", () => {
  it("subtracts the renewal cycle months from the expiry", () => {
    const start = deriveRenewalCycleStart({
      expiresAt: EXPIRES_AT,
      renewalCycleMonths: 24,
    })
    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(5)
  })

  it("falls back to 24 months when none is provided", () => {
    const fromNull = deriveRenewalCycleStart({
      expiresAt: EXPIRES_AT,
      renewalCycleMonths: null,
    })
    const fromUndefined = deriveRenewalCycleStart({ expiresAt: EXPIRES_AT })
    expect(fromNull.getFullYear()).toBe(2024)
    expect(fromUndefined.getFullYear()).toBe(2024)
  })

  it("honors a non-default cycle length", () => {
    const start = deriveRenewalCycleStart({
      expiresAt: EXPIRES_AT,
      renewalCycleMonths: 12,
    })
    expect(start.getFullYear()).toBe(2025)
    expect(start.getMonth()).toBe(5)
  })
})
