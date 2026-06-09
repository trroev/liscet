import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import { describe, expect, it } from "vitest"
import { miLmswCRuleSet } from "./index"

const RENEWAL_CYCLE_START = new Date("2025-01-01T00:00:00.000Z")
const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z")

const license = { id: "license-1", renewalCycleStart: RENEWAL_CYCLE_START }

const buildCourse = (
  overrides: Partial<EvaluatedCourse> = {}
): EvaluatedCourse => ({
  courseId: "course-1",
  completedAt: new Date("2025-06-01T00:00:00.000Z"),
  hours: 5,
  format: "live",
  subjectCategories: ["ethics"],
  ...overrides,
})

describe("miLmswCRuleSet", () => {
  it("matches the partner-confirmed MI-LMSW-C requirements", () => {
    expect(miLmswCRuleSet).toMatchInlineSnapshot(`
      {
        "acceptedFormats": [
          "live",
          "home-study",
          "in-person",
        ],
        "carryOverMaxHours": null,
        "categoryMinimums": [
          {
            "category": "ethics",
            "minHours": 5,
          },
          {
            "category": "pain-symptom-management",
            "minHours": 2,
          },
          {
            "category": "human-trafficking",
            "minHours": 2,
          },
        ],
        "formatConstraints": [
          {
            "formats": [
              "live",
              "in-person",
            ],
            "hours": 22.5,
            "kind": "min-hours",
          },
        ],
        "licenseType": "LMSW-C",
        "providerCaps": [],
        "renewalCycleMonths": 36,
        "specialRequirements": [],
        "state": "MI",
        "totalHours": 45,
        "version": 1,
      }
    `)
  })

  it("requires 45 total hours over a 36-month triennial cycle", () => {
    expect(miLmswCRuleSet.totalHours).toBe(45)
    expect(miLmswCRuleSet.renewalCycleMonths).toBe(36)
  })

  it("requires a 5-hour ethics minimum every period", () => {
    expect(miLmswCRuleSet.categoryMinimums).toContainEqual({
      category: "ethics",
      minHours: 5,
    })
  })

  it("requires at least half the hours to be live/synchronous", () => {
    expect(miLmswCRuleSet.formatConstraints).toContainEqual({
      kind: "min-hours",
      formats: ["live", "in-person"],
      hours: 22.5,
    })
  })

  it("credits a qualifying MI-LMSW-C ethics course", () => {
    const result = evaluateCourse({
      course: buildCourse(),
      license,
      ruleSet: miLmswCRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toEqual({
      courseId: "course-1",
      licenseId: "license-1",
      creditedHours: 5,
      creditedCategories: ["ethics"],
      ruleSetVersion: 1,
      evaluatedAt: EVALUATED_AT,
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      format: "live",
      approvingBody: null,
    })
  })
})
