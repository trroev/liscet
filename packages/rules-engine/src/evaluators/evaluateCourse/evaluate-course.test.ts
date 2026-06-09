import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import type { RuleSet } from "@repo/rules-engine/types/RuleSet"
import { describe, expect, it } from "vitest"
import { evaluateCourse } from "./index"

const RENEWAL_CYCLE_START = new Date("2025-01-01T00:00:00.000Z")
const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z")

const license = { id: "license-1", renewalCycleStart: RENEWAL_CYCLE_START }

const ruleSet: RuleSet = {
  state: "CA",
  licenseType: "LCSW",
  version: 3,
  renewalCycleMonths: 24,
  totalHours: 36,
  acceptedFormats: ["live", "in-person"],
  categoryMinimums: [
    { category: "general", minHours: 20 },
    { category: "law-and-ethics", minHours: 6 },
  ],
  formatConstraints: [],
  specialRequirements: [],
  carryOverMaxHours: null,
}

const buildCourse = (
  overrides: Partial<EvaluatedCourse> = {}
): EvaluatedCourse => ({
  courseId: "course-1",
  completedAt: new Date("2025-06-01T00:00:00.000Z"),
  hours: 10,
  format: "live",
  subjectCategories: ["general"],
  ...overrides,
})

describe("evaluateCourse", () => {
  it("credits a qualifying course", () => {
    const result = evaluateCourse({
      course: buildCourse(),
      license,
      ruleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toEqual({
      courseId: "course-1",
      licenseId: "license-1",
      creditedHours: 10,
      creditedCategories: ["general"],
      ruleSetVersion: 3,
      evaluatedAt: EVALUATED_AT,
    })
  })

  it("returns null when the format is not accepted", () => {
    const result = evaluateCourse({
      course: buildCourse({ format: "home-study" }),
      license,
      ruleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toBeNull()
  })

  it("returns null when no category is required by the rule set", () => {
    const result = evaluateCourse({
      course: buildCourse({ subjectCategories: ["clinical", "telehealth"] }),
      license,
      ruleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toBeNull()
  })

  it("returns null when the course has zero hours", () => {
    const result = evaluateCourse({
      course: buildCourse({ hours: 0 }),
      license,
      ruleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toBeNull()
  })

  it("caps a carried-over course's hours at carryOverMaxHours", () => {
    const cappedRuleSet: RuleSet = { ...ruleSet, carryOverMaxHours: 4 }
    const result = evaluateCourse({
      course: buildCourse({
        completedAt: new Date("2024-11-01T00:00:00.000Z"),
        hours: 10,
      }),
      license,
      ruleSet: cappedRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result?.creditedHours).toBe(4)
  })

  it("does not cap a current-cycle course of the same hours", () => {
    const cappedRuleSet: RuleSet = { ...ruleSet, carryOverMaxHours: 4 }
    const result = evaluateCourse({
      course: buildCourse({
        completedAt: new Date("2025-06-01T00:00:00.000Z"),
        hours: 10,
      }),
      license,
      ruleSet: cappedRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result?.creditedHours).toBe(10)
  })

  it("normalizes raw tags and drops unrecognized ones", () => {
    const result = evaluateCourse({
      course: buildCourse({
        subjectCategories: [" General ", "Law-And-Ethics", "made-up"],
      }),
      license,
      ruleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result?.creditedCategories).toEqual(["general", "law-and-ethics"])
  })
})
