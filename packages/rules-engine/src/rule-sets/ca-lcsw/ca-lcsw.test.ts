import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import { summarizeLicense } from "@repo/rules-engine/evaluators/summarizeLicense"
import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
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
        "providerCaps": [],
        "renewalCycleMonths": 24,
        "specialRequirements": [
          {
            "category": "suicide-risk",
            "effectiveFrom": "2021-01-01",
            "minHours": 6,
            "recurrence": "one-time",
          },
          {
            "category": "telehealth",
            "effectiveFrom": "2023-07-01",
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
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      format: "live",
      approvingBody: null,
    })
  })

  it("credits a suicide-risk course now that special requirements qualify", () => {
    const result = evaluateCourse({
      course: buildCourse({ subjectCategories: ["suicide-risk"] }),
      license,
      ruleSet: caLcswRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result?.creditedCategories).toEqual(["suicide-risk"])
  })

  it("owes neither dated requirement when the gating date precedes both triggers", () => {
    const summary = summarizeLicense({
      license: {
        id: "license-1",
        issuedAt: new Date("2020-06-01T00:00:00.000Z"),
        renewalCycleMonths: 24,
      },
      credits: [],
      today: EVALUATED_AT,
      ruleSet: caLcswRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([])
  })

  it("owes both dated requirements when the gating date is on or after both triggers", () => {
    const buildCredit = (
      overrides: Partial<CourseCreditResult>
    ): CourseCreditResult => ({
      courseId: "course-x",
      licenseId: "license-1",
      creditedHours: 0,
      creditedCategories: [],
      ruleSetVersion: 1,
      evaluatedAt: EVALUATED_AT,
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      format: "live",
      approvingBody: null,
      ...overrides,
    })

    const summary = summarizeLicense({
      license: {
        id: "license-1",
        issuedAt: new Date("2024-01-01T00:00:00.000Z"),
        renewalCycleMonths: 24,
      },
      credits: [
        buildCredit({
          courseId: "course-suicide-risk",
          creditedHours: 6,
          creditedCategories: ["suicide-risk"],
        }),
        buildCredit({
          courseId: "course-telehealth",
          creditedHours: 3,
          creditedCategories: ["telehealth"],
        }),
      ],
      today: EVALUATED_AT,
      ruleSet: caLcswRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "suicide-risk", credited: 6, required: 6 },
      { category: "telehealth", credited: 3, required: 3 },
    ])
  })
})
