import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

/**
 * Massachusetts — LICSW continuing-education rule set (MA Board of Registration
 * of Social Workers). Values sourced from `docs/rule-sets/ma-licsw.md`.
 *
 * Note: the doc's 25%-from-approved-providers cap is keyed to the *approving
 * body* (APA/NBCC/NHA/ANCC/ACCME), not a delivery `CourseFormat`, so the
 * `formatConstraints` `max-fraction` shape cannot express it faithfully —
 * encoding it would freeze a semantic falsehood into the snapshot. It is
 * omitted here pending a deliberate `RuleSet` extension (approving-body
 * dimension) tracked as a follow-up to #21.
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
  specialRequirements: [],
  carryOverMaxHours: null,
} as const satisfies RuleSet
