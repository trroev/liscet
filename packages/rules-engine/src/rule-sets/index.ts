import { caLcswRuleSet } from "@repo/rules-engine/rule-sets/ca-lcsw"
import { ctLicswRuleSet } from "@repo/rules-engine/rule-sets/ct-licsw"
import { maLicswRuleSet } from "@repo/rules-engine/rule-sets/ma-licsw"
import { miLmswCRuleSet } from "@repo/rules-engine/rule-sets/mi-lmsw-c"
import type { RuleSet } from "@repo/rules-engine/types/RuleSet"

export { caLcswRuleSet } from "@repo/rules-engine/rule-sets/ca-lcsw"
export { ctLicswRuleSet } from "@repo/rules-engine/rule-sets/ct-licsw"
export { maLicswRuleSet } from "@repo/rules-engine/rule-sets/ma-licsw"
export { miLmswCRuleSet } from "@repo/rules-engine/rule-sets/mi-lmsw-c"

/**
 * Every shipped rule set, keyed by `${state}-${licenseType}` for lookup in
 * hooks. `RuleSetKey` gives consumers a precise lookup type.
 */
export const RULE_SETS = {
  "CA-LCSW": caLcswRuleSet,
  "MA-LICSW": maLicswRuleSet,
  "MI-LMSW-C": miLmswCRuleSet,
  "CT-LICSW": ctLicswRuleSet,
} as const satisfies Record<string, RuleSet>

export type RuleSetKey = keyof typeof RULE_SETS
