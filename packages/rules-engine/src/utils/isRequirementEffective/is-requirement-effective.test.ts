import type { SpecialRequirement } from "@repo/rules-engine/types/RuleSet"
import { describe, expect, it } from "vitest"
import { isRequirementEffective } from "./index"

const buildRequirement = (
  overrides: Partial<SpecialRequirement> = {}
): SpecialRequirement => ({
  category: "suicide-risk",
  minHours: 6,
  recurrence: "one-time",
  ...overrides,
})

describe("isRequirementEffective", () => {
  it("treats a requirement with no effectiveFrom as always effective", () => {
    const requirement = buildRequirement()

    expect(
      isRequirementEffective({
        requirement,
        asOf: new Date("1970-01-01T00:00:00.000Z"),
      })
    ).toBe(true)
  })

  it("is not effective when asOf is before the trigger date", () => {
    const requirement = buildRequirement({ effectiveFrom: "2021-01-01" })

    expect(
      isRequirementEffective({
        requirement,
        asOf: new Date("2020-12-31T00:00:00.000Z"),
      })
    ).toBe(false)
  })

  it("is effective when asOf is exactly the trigger date (on or after)", () => {
    const requirement = buildRequirement({ effectiveFrom: "2021-01-01" })

    expect(
      isRequirementEffective({
        requirement,
        asOf: new Date("2021-01-01T00:00:00.000Z"),
      })
    ).toBe(true)
  })

  it("is effective when asOf is after the trigger date", () => {
    const requirement = buildRequirement({ effectiveFrom: "2021-01-01" })

    expect(
      isRequirementEffective({
        requirement,
        asOf: new Date("2025-06-01T00:00:00.000Z"),
      })
    ).toBe(true)
  })
})
