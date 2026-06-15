import type { License } from "@repo/payload/payload-types"
import { RULE_SETS, type RuleSetKey } from "@repo/rules-engine/rule-sets"

/**
 * Resolve a License's `(state, licenseType)` pair to the key of its shipped
 * rule set, or `null` when no rule set ships for that pair. The `${state}-${type}`
 * key format is owned here and nowhere else.
 */
export const ruleSetKeyFor = (license: License): RuleSetKey | null => {
  const key = `${license.state}-${license.licenseType}`
  return key in RULE_SETS ? (key as RuleSetKey) : null
}
