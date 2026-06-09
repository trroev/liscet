import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import { describe, expect, it } from "vitest"
import { caLcswRuleSet } from "./index"

const RENEWAL_CYCLE_START = new Date("2025-01-01T00:00:00.000Z")
const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z")

const license = { id: "license-1", renewalCycleStart: RENEWAL_CYCLE_START }

const buildCourse = (
  overrides: Partial<EvaluatedCourse> = {}
): EvaluatedCourse => ({
  courseId: "course-1",
  completedAt: new Date("2025-06-01T00:00:00.000Z"),
  hours: 6,
  format: "live",
  subjectCategories: ["law-and-ethics"],
  ...overrides,
})

describe("caLcswRuleSet", () => {
  it("matches the partner-confirmed CA-LCSW requirements", () => {
    expect(caLcswRuleSet).toMatchInlineSnapshot(`
      {
        "acceptedFormats": [
          "live",
          "home-study",
          "in-person",
        ],
        "carryOverMaxHours": null,
        "categoryMinimums": [
          {
            "category": "law-and-ethics",
            "minHours": 6,
          },
        ],
        "formatConstraints": [],
        "licenseType": "LCSW",
        "renewalCycleMonths": 24,
        "specialRequirements": [
          {
            "category": "suicide-risk",
            "minHours": 6,
            "recurrence": "one-time",
          },
          {
            "category": "telehealth",
            "minHours": 3,
            "recurrence": "one-time",
          },
        ],
        "state": "CA",
        "totalHours": 36,
        "version": 1,
      }
    `)
  })

  it("requires 36 total hours over a 24-month biennial cycle", () => {
    expect(caLcswRuleSet.totalHours).toBe(36)
    expect(caLcswRuleSet.renewalCycleMonths).toBe(24)
  })

  it("requires a 6-hour law-and-ethics minimum every period", () => {
    expect(caLcswRuleSet.categoryMinimums).toContainEqual({
      category: "law-and-ethics",
      minHours: 6,
    })
  })

  it("credits a qualifying CA-LCSW law-and-ethics course", () => {
    const result = evaluateCourse({
      course: buildCourse(),
      license,
      ruleSet: caLcswRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toEqual({
      courseId: "course-1",
      licenseId: "license-1",
      creditedHours: 6,
      creditedCategories: ["law-and-ethics"],
      ruleSetVersion: 1,
      evaluatedAt: EVALUATED_AT,
    })
  })
})
