import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type { RuleSet } from "@repo/rules-engine/types/RuleSet"
import { describe, expect, it } from "vitest"
import { summarizeLicense } from "./index"

const ISSUED_AT = new Date("2025-01-01T00:00:00.000Z")
const TODAY = new Date("2025-06-01T00:00:00.000Z")
const EVALUATED_AT = new Date("2025-06-01T00:00:00.000Z")

const license = {
  id: "license-1",
  issuedAt: ISSUED_AT,
  renewalCycleMonths: 24,
}

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

const buildCredit = (
  overrides: Partial<CourseCreditResult> = {}
): CourseCreditResult => ({
  courseId: "course-1",
  licenseId: "license-1",
  creditedHours: 10,
  creditedCategories: ["general"],
  ruleSetVersion: 3,
  evaluatedAt: EVALUATED_AT,
  ...overrides,
})

describe("summarizeLicense", () => {
  it("reports an incomplete license below total and category minimums", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({ creditedHours: 10, creditedCategories: ["general"] }),
      ],
      today: TODAY,
      ruleSet,
    })

    expect(summary.totalCreditedHours).toBe(10)
    expect(summary.requiredHours).toBe(36)
    expect(summary.isComplete).toBe(false)
    expect(summary.categoryProgress).toEqual([
      { category: "general", credited: 10, required: 20 },
      { category: "law-and-ethics", credited: 0, required: 6 },
    ])
  })

  it("reports a complete license when total and every category minimum are met", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 30,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 6,
          creditedCategories: ["law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet,
    })

    expect(summary.totalCreditedHours).toBe(36)
    expect(summary.isComplete).toBe(true)
    expect(summary.categoryProgress).toEqual([
      { category: "general", credited: 30, required: 20 },
      { category: "law-and-ethics", credited: 6, required: 6 },
    ])
  })

  it("stays incomplete when total hours are met but a category is short", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 34,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 4,
          creditedCategories: ["law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet,
    })

    expect(summary.totalCreditedHours).toBe(38)
    expect(summary.totalCreditedHours).toBeGreaterThanOrEqual(
      summary.requiredHours
    )
    expect(summary.isComplete).toBe(false)
  })

  it("stays incomplete when every category is met but total hours fall short", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 20,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 6,
          creditedCategories: ["law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet,
    })

    expect(summary.totalCreditedHours).toBe(26)
    expect(
      summary.categoryProgress.every((p) => p.credited >= p.required)
    ).toBe(true)
    expect(summary.isComplete).toBe(false)
  })

  it("credits the full hours of a multi-category course to each category while counting once toward the total", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 8,
          creditedCategories: ["general", "law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet,
    })

    expect(summary.totalCreditedHours).toBe(8)
    expect(summary.categoryProgress).toEqual([
      { category: "general", credited: 8, required: 20 },
      { category: "law-and-ethics", credited: 8, required: 6 },
    ])
  })

  const datedRuleSet: RuleSet = {
    ...ruleSet,
    specialRequirements: [
      {
        category: "suicide-risk",
        minHours: 6,
        recurrence: "one-time",
        effectiveFrom: "2026-01-01",
      },
    ],
  }

  it("excludes a special requirement whose effectiveFrom is after the gating date", () => {
    const summary = summarizeLicense({
      license,
      credits: [],
      today: TODAY,
      ruleSet: datedRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([])
  })

  it("does not let a not-yet-effective special requirement block completion", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 30,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 6,
          creditedCategories: ["law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet: datedRuleSet,
    })

    expect(summary.isComplete).toBe(true)
  })

  it("includes an effective special requirement and keeps the license incomplete until it is met", () => {
    const reactivatedLicense = {
      ...license,
      reactivationDate: new Date("2026-06-01T00:00:00.000Z"),
    }
    const summary = summarizeLicense({
      license: reactivatedLicense,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 30,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 6,
          creditedCategories: ["law-and-ethics"],
        }),
      ],
      today: TODAY,
      ruleSet: datedRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "suicide-risk", credited: 0, required: 6 },
    ])
    expect(summary.isComplete).toBe(false)
  })

  it("counts a met effective special requirement toward completion", () => {
    const reactivatedLicense = {
      ...license,
      reactivationDate: new Date("2026-06-01T00:00:00.000Z"),
    }
    const summary = summarizeLicense({
      license: reactivatedLicense,
      credits: [
        buildCredit({
          courseId: "course-general",
          creditedHours: 30,
          creditedCategories: ["general"],
        }),
        buildCredit({
          courseId: "course-ethics",
          creditedHours: 6,
          creditedCategories: ["law-and-ethics"],
        }),
        buildCredit({
          courseId: "course-suicide-risk",
          creditedHours: 6,
          creditedCategories: ["suicide-risk"],
        }),
      ],
      today: TODAY,
      ruleSet: datedRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "suicide-risk", credited: 6, required: 6 },
    ])
    expect(summary.isComplete).toBe(true)
  })

  it("derives renewsAt from issuedAt plus the license renewal cycle, ignoring today", () => {
    const summary = summarizeLicense({
      license,
      credits: [],
      today: TODAY,
      ruleSet,
    })

    expect(summary.renewsAt).toEqual(new Date("2027-01-01T00:00:00.000Z"))
  })

  it("clamps renewsAt to the last day of the month when the issue day overflows", () => {
    const summary = summarizeLicense({
      license: {
        id: "license-2",
        issuedAt: new Date("2025-01-31T00:00:00.000Z"),
        renewalCycleMonths: 1,
      },
      credits: [],
      today: TODAY,
      ruleSet,
    })

    expect(summary.renewsAt).toEqual(new Date("2025-02-28T00:00:00.000Z"))
  })
})
