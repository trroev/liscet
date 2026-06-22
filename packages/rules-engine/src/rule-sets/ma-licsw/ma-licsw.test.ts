import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import { describe, expect, it } from "vitest"
import { maLicswRuleSet } from "./index"

const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z")

const license = {
  id: "license-1",
  expiresAt: new Date("2027-01-01T00:00:00.000Z"),
  renewalCycleMonths: 24,
}

const buildCourse = (
  overrides: Partial<EvaluatedCourse> = {}
): EvaluatedCourse => ({
  courseId: "course-1",
  completedAt: new Date("2025-06-01T00:00:00.000Z"),
  hours: 10,
  format: "live",
  subjectCategories: ["clinical"],
  ...overrides,
})

describe("maLicswRuleSet", () => {
  it("matches the partner-confirmed MA-LICSW requirements", () => {
    expect(maLicswRuleSet).toMatchInlineSnapshot(`
      {
        "acceptedFormats": [
          "live",
          "home-study",
          "in-person",
        ],
        "carryOverMaxHours": null,
        "categoryMinimums": [
          {
            "category": "clinical",
            "minHours": 10,
          },
          {
            "category": "ethics",
            "minHours": 3,
          },
          {
            "category": "anti-racism",
            "minHours": 2,
          },
          {
            "category": "anti-discrimination",
            "minHours": 1,
          },
          {
            "category": "domestic-sexual-violence",
            "minHours": 2,
          },
        ],
        "formatConstraints": [],
        "licenseType": "LICSW",
        "providerCaps": [
          {
            "approvingBodies": [
              "APA",
              "NBCC",
              "NHA",
              "ANCC",
              "ACCME",
            ],
            "fraction": 0.25,
            "kind": "max-fraction",
          },
        ],
        "renewalCycleMonths": 24,
        "specialRequirements": [],
        "state": "MA",
        "totalHours": 30,
        "version": 1,
      }
    `)
  })

  it("requires 30 total hours over a 24-month biennial cycle", () => {
    expect(maLicswRuleSet.totalHours).toBe(30)
    expect(maLicswRuleSet.renewalCycleMonths).toBe(24)
  })

  it("requires a 10-hour clinical minimum every period", () => {
    expect(maLicswRuleSet.categoryMinimums).toContainEqual({
      category: "clinical",
      minHours: 10,
    })
  })

  it("caps approved-provider hours at 25% of the period", () => {
    expect(maLicswRuleSet.providerCaps).toContainEqual({
      kind: "max-fraction",
      approvingBodies: ["APA", "NBCC", "NHA", "ANCC", "ACCME"],
      fraction: 0.25,
    })
  })

  it("credits a qualifying MA-LICSW clinical course", () => {
    const result = evaluateCourse({
      course: buildCourse(),
      license,
      ruleSet: maLicswRuleSet,
      evaluatedAt: EVALUATED_AT,
    })

    expect(result).toEqual({
      courseId: "course-1",
      licenseId: "license-1",
      creditedHours: 10,
      creditedCategories: ["clinical"],
      ruleSetVersion: 1,
      evaluatedAt: EVALUATED_AT,
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      format: "live",
      approvingBody: null,
    })
  })
})
