import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * Massachusetts — LICSW continuing-education rule set (MA Board of Registration
 * of Social Workers). Values sourced from `docs/rule-sets/ma-licsw.md`.
 *
 * The 25%-from-approved-providers cap is keyed to the course's approving body
 * (APA/NBCC/NHA/ANCC/ACCME), modeled via `providerCaps` — orthogonal to delivery
 * `CourseFormat`.
 */
export const maLicswRuleSet = {
  state: "MA",
  licenseType: "LICSW",
  version: 1,
  renewalCycleMonths: 24,
  totalHours: 30,
  acceptedFormats: ["live", "home-study", "in-person"],
  categoryMinimums: [
    { category: "clinical", minHours: 10 },
    { category: "ethics", minHours: 3 },
    { category: "anti-racism", minHours: 2 },
    { category: "anti-discrimination", minHours: 1 },
    { category: "domestic-sexual-violence", minHours: 2 },
  ],
  formatConstraints: [],
  providerCaps: [
    {
      kind: "max-fraction",
      approvingBodies: ["APA", "NBCC", "NHA", "ANCC", "ACCME"],
      fraction: 0.25,
    },
  ],
  specialRequirements: [],
  carryOverMaxHours: null,
} as const satisfies RuleSet
