import type { RuleSet } from "@repo/rules-engine/types/RuleSet"
import { caLcswRuleSet } from "./ca-lcsw"
import { ctLicswRuleSet } from "./ct-licsw"
import { maLicswRuleSet } from "./ma-licsw"
import { miLmswCRuleSet } from "./mi-lmsw-c"

export { caLcswRuleSet } from "./ca-lcsw"
export { ctLicswRuleSet } from "./ct-licsw"
export { maLicswRuleSet } from "./ma-licsw"
export { miLmswCRuleSet } from "./mi-lmsw-c"

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
