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
  providerCaps: [],
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
  completedAt: new Date("2025-03-01T00:00:00.000Z"),
  format: "live",
  approvingBody: null,
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

  const recurringRuleSet: RuleSet = {
    ...ruleSet,
    specialRequirements: [
      {
        category: "veterans-mental-health",
        minHours: 2,
        recurrence: { everyMonths: 72 },
      },
    ],
  }

  // License issued 2025-01-01; first 72-month window is [2025-01-01, 2031-01-01),
  // the second [2031-01-01, 2037-01-01).
  const fullBaseCredits = [
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
  ]

  it("counts a recurring requirement credit earned in the current window", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        ...fullBaseCredits,
        buildCredit({
          courseId: "course-veterans",
          creditedHours: 2,
          creditedCategories: ["veterans-mental-health"],
          completedAt: new Date("2032-06-01T00:00:00.000Z"),
        }),
      ],
      today: new Date("2033-01-01T00:00:00.000Z"),
      ruleSet: recurringRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "veterans-mental-health", credited: 2, required: 2 },
    ])
    expect(summary.isComplete).toBe(true)
  })

  it("ignores a recurring requirement credit earned in a prior window", () => {
    const summary = summarizeLicense({
      license,
      credits: [
        ...fullBaseCredits,
        buildCredit({
          courseId: "course-veterans",
          creditedHours: 2,
          creditedCategories: ["veterans-mental-health"],
          completedAt: new Date("2026-06-01T00:00:00.000Z"),
        }),
      ],
      today: new Date("2033-01-01T00:00:00.000Z"),
      ruleSet: recurringRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "veterans-mental-health", credited: 0, required: 2 },
    ])
    expect(summary.isComplete).toBe(false)
  })

  it("does not window a one-time requirement — an old credit still counts", () => {
    const oneTimeRuleSet: RuleSet = {
      ...ruleSet,
      specialRequirements: [
        {
          category: "suicide-risk",
          minHours: 6,
          recurrence: "one-time",
        },
      ],
    }
    const summary = summarizeLicense({
      license,
      credits: [
        buildCredit({
          courseId: "course-suicide-risk",
          creditedHours: 6,
          creditedCategories: ["suicide-risk"],
          completedAt: new Date("2025-02-01T00:00:00.000Z"),
        }),
      ],
      today: new Date("2033-01-01T00:00:00.000Z"),
      ruleSet: oneTimeRuleSet,
    })

    expect(summary.specialRequirementProgress).toEqual([
      { category: "suicide-risk", credited: 6, required: 6 },
    ])
  })

  it("enforces a min-hours format constraint (MI-style ≥22.5 live/in-person)", () => {
    const formatMinRuleSet: RuleSet = {
      ...ruleSet,
      categoryMinimums: [],
      totalHours: 22.5,
      formatConstraints: [
        { kind: "min-hours", formats: ["live", "in-person"], hours: 22.5 },
      ],
    }

    const met = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 22.5,
          creditedCategories: [],
          format: "live",
        }),
      ],
      today: TODAY,
      ruleSet: formatMinRuleSet,
    })
    expect(met.formatConstraintProgress).toEqual([
      {
        kind: "min-hours",
        creditedHours: 22.5,
        limitHours: 22.5,
        satisfied: true,
      },
    ])
    expect(met.isComplete).toBe(true)

    const unmet = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 22.5,
          creditedCategories: [],
          format: "home-study",
        }),
      ],
      today: TODAY,
      ruleSet: formatMinRuleSet,
    })
    expect(unmet.formatConstraintProgress[0]?.satisfied).toBe(false)
    expect(unmet.isComplete).toBe(false)
  })

  it("flags but does not block on a max-hours format cap (CT-style home-study ≤10)", () => {
    const formatMaxRuleSet: RuleSet = {
      ...ruleSet,
      categoryMinimums: [],
      totalHours: 5,
      formatConstraints: [
        { kind: "max-hours", formats: ["home-study"], hours: 10 },
      ],
    }

    const within = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 8,
          creditedCategories: [],
          format: "home-study",
        }),
      ],
      today: TODAY,
      ruleSet: formatMaxRuleSet,
    })
    expect(within.formatConstraintProgress[0]?.satisfied).toBe(true)

    const exceeded = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 12,
          creditedCategories: [],
          format: "home-study",
        }),
      ],
      today: TODAY,
      ruleSet: formatMaxRuleSet,
    })
    expect(exceeded.formatConstraintProgress[0]?.satisfied).toBe(false)
    // A max cap limits credit, not eligibility — total is met, so still complete.
    expect(exceeded.isComplete).toBe(true)
  })

  it("flags but does not block on a max-fraction provider cap (MA-style ≤25%)", () => {
    const providerCapRuleSet: RuleSet = {
      ...ruleSet,
      categoryMinimums: [],
      totalHours: 30,
      providerCaps: [
        { kind: "max-fraction", approvingBodies: ["APA"], fraction: 0.25 },
      ],
    }

    const within = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 6,
          creditedCategories: [],
          approvingBody: "APA",
        }),
        buildCredit({
          creditedHours: 24,
          creditedCategories: [],
          approvingBody: null,
        }),
      ],
      today: TODAY,
      ruleSet: providerCapRuleSet,
    })
    expect(within.providerCapProgress).toEqual([
      {
        kind: "max-fraction",
        creditedHours: 6,
        limitHours: 7.5,
        satisfied: true,
      },
    ])

    const exceeded = summarizeLicense({
      license,
      credits: [
        buildCredit({
          creditedHours: 9,
          creditedCategories: [],
          approvingBody: "APA",
        }),
        buildCredit({
          creditedHours: 21,
          creditedCategories: [],
          approvingBody: null,
        }),
      ],
      today: TODAY,
      ruleSet: providerCapRuleSet,
    })
    expect(exceeded.providerCapProgress[0]?.satisfied).toBe(false)
    expect(exceeded.isComplete).toBe(true)
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
