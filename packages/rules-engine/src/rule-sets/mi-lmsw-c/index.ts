import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * Michigan — LMSW-C continuing-education rule set (Michigan LARA, Board of
 * Social Work). Values sourced from `docs/rule-sets/mi-lmsw-c.md`.
 *
 * Note: per the doc, the human-trafficking 2h is modeled as a per-cycle
 * `categoryMinimum` (its recurring-vs-one-time cadence is the open partner
 * question in the doc); revisit if MI confirms it is one-time.
 */
export const miLmswCRuleSet = {
  state: "MI",
  licenseType: "LMSW-C",
  version: 1,
  renewalCycleMonths: 36,
  totalHours: 45,
  acceptedFormats: ["live", "home-study", "in-person"],
  categoryMinimums: [
    { category: "ethics", minHours: 5 },
    { category: "pain-symptom-management", minHours: 2 },
    { category: "human-trafficking", minHours: 2 },
  ],
  formatConstraints: [
    { kind: "min-hours", formats: ["live", "in-person"], hours: 22.5 },
  ],
  specialRequirements: [],
  carryOverMaxHours: null,
} as const satisfies RuleSet
