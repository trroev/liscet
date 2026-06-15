import { describe, expect, it } from "vitest"
import {
  isRenewalCycleMonths,
  toRenewalCycleOptionValue,
} from "./renewal-cycle"

describe("isRenewalCycleMonths", () => {
  it("accepts the supported cycles", () => {
    expect(isRenewalCycleMonths(12)).toBe(true)
    expect(isRenewalCycleMonths(24)).toBe(true)
    expect(isRenewalCycleMonths(36)).toBe(true)
  })

  it("rejects unsupported cycles", () => {
    expect(isRenewalCycleMonths(18)).toBe(false)
    expect(isRenewalCycleMonths(0)).toBe(false)
  })
})

describe("toRenewalCycleOptionValue", () => {
  it("returns the matching option value for a supported cycle", () => {
    expect(toRenewalCycleOptionValue(12)).toBe("12")
    expect(toRenewalCycleOptionValue(36)).toBe("36")
  })

  it("falls back to the default cycle for unsupported values", () => {
    expect(toRenewalCycleOptionValue(18)).toBe("24")
  })
})
