import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * California — LCSW continuing-education rule set (CA Board of Behavioral
 * Sciences). Values sourced from `docs/rule-sets/ca-lcsw.md`. First concrete
 * rule set and the reference pattern for subsequent states.
 *
 * Note: the doc's special requirements carry conditional trigger dates
 * (suicide-risk >= 2021-01-01, telehealth >= 2023-07-01), expressed via each
 * requirement's `effectiveFrom`. They apply only to licensees whose
 * renewal/reactivation date is on or after the trigger.
 */
export const caLcswRuleSet = {
  state: "CA",
  licenseType: "LCSW",
  version: 1,
  renewalCycleMonths: 24,
  totalHours: 36,
  acceptedFormats: ["live", "home-study", "in-person"],
  categoryMinimums: [{ category: "law-and-ethics", minHours: 6 }],
  formatConstraints: [],
  providerCaps: [],
  specialRequirements: [
    {
      category: "suicide-risk",
      minHours: 6,
      recurrence: "one-time",
      effectiveFrom: "2021-01-01",
    },
    {
      category: "telehealth",
      minHours: 3,
      recurrence: "one-time",
      effectiveFrom: "2023-07-01",
    },
  ],
  carryOverMaxHours: null,
} as const satisfies RuleSet
