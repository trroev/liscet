import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * California — LCSW continuing-education rule set (CA Board of Behavioral
 * Sciences). Values sourced from `docs/rule-sets/ca-lcsw.md`. First concrete
 * rule set and the reference pattern for subsequent states.
 *
 * Note: the doc's special requirements carry conditional trigger dates
 * (suicide-risk >= 2021-01-01, telehealth >= 2023-07-01) that the
 * `SpecialRequirement` type cannot express today, so they are encoded as
 * unconditional `one-time` entries — the most faithful representation the
 * current type allows.
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
  specialRequirements: [
    { category: "suicide-risk", minHours: 6, recurrence: "one-time" },
    { category: "telehealth", minHours: 3, recurrence: "one-time" },
  ],
  carryOverMaxHours: null,
} as const satisfies RuleSet
