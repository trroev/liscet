import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * Connecticut — LICSW continuing-education rule set (CT Department of Public
 * Health, Practitioner Licensing). Values sourced from
 * `docs/rule-sets/ct-licsw.md`. Annual registration period.
 */
export const ctLicswRuleSet = {
  state: "CT",
  licenseType: "LICSW",
  version: 1,
  renewalCycleMonths: 12,
  totalHours: 15,
  acceptedFormats: ["live", "home-study", "in-person"],
  categoryMinimums: [{ category: "cultural-competency", minHours: 1 }],
  formatConstraints: [
    { kind: "max-hours", formats: ["home-study"], hours: 10 },
  ],
  specialRequirements: [
    {
      category: "veterans-mental-health",
      minHours: 2,
      recurrence: { everyMonths: 72 },
    },
  ],
  carryOverMaxHours: null,
} as const satisfies RuleSet
