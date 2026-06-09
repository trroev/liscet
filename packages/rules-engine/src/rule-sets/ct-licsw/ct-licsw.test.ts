import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import { describe, expect, it } from "vitest"
import { ctLicswRuleSet } from "./index"

const RENEWAL_CYCLE_START = new Date("2025-01-01T00:00:00.000Z")
const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z")

const license = { id: "license-1", renewalCycleStart: RENEWAL_CYCLE_START }

const buildCourse = (
  overrides: Partial<EvaluatedCourse> = {}
): EvaluatedCourse => ({
  courseId: "course-1",
  completedAt: new Date("2025-06-01T00:00:00.000Z"),
  hours: 1,
  format: "live",
  subjectCategories: ["cultural-competency"],
  ...overrides,
})

describe("ctLicswRuleSet", () => {
  it("matches the partner-confirmed CT-LICSW requirements", () => {
    expect(ctLicswRuleSet).toMatchInlineSnapshot(`
      {
        "acceptedFormats": [
          "live",
          "home-study",
          "in-person",
        ],
        "carryOverMaxHours": null,
        "categoryMinimums": [
          {
            "category": "cultural-competency",
            "minHours": 1,
          },
        ],
        "formatConstraints": [
          {
            "formats": [
              "home-study",
            ],
            "hours": 10,
            "kind": "max-hours",
          },
        ],
        "licenseType": "LICSW",
        "providerCaps": [],
        "renewalCycleMonths": 12,
        "specialRequirements": [
          {
            "category": "veterans-mental-health",
            "minHours": 2,
            "recurrence": {
              "everyMonths": 72,
            },
          },
        ],
        "state": "CT",
        "totalHours": 15,
        "version": 1,
      }
    `)
  })

  it("requires 15 total hours over a 12-month annual cycle", () => {
    expect(ctLicswRuleSet.totalHours).toBe(15)
    expect(ctLicswRuleSet.renewalCycleMonths).toBe(12)
  })

  it("requires a 1-hour cultural-competency minimum every period", () => {
    expect(ctLicswRuleSet.categoryMinimums).toContainEqual({
      category: "cultural-competency",
      minHours: 1,
    })
  })

  it("caps online/home-study at 10 of the 15 hours", () => {
    expect(ctLicswRuleSet.formatConstraints).toContainEqual({
      kind: "max-hours",
      formats: ["home-study"],
      hours: 10,
    })
  })

  it("credits a qualifying CT-LICSW cultural-competency course", () => {
    const result = evaluateCourse({
      course: buildCourse(),
      license,
      ruleSet: ctLicswRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toEqual({
      courseId: "course-1",
      licenseId: "license-1",
      creditedHours: 1,
      creditedCategories: ["cultural-competency"],
      ruleSetVersion: 1,
      evaluatedAt: EVALUATED_AT,
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      format: "live",
      approvingBody: null,
    })
  })
})
