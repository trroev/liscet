import type { CourseCredit, License } from "@repo/payload/payload-types"
import { summarizeLicense } from "@repo/rules-engine/evaluators/summarizeLicense"
import { RULE_SETS } from "@repo/rules-engine/rule-sets"
import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"
import { DEFAULT_RENEWAL_CYCLE_MONTHS } from "./default-renewal-cycle"
import { ruleSetKeyFor } from "./rule-set-key"
import { toCreditResult } from "./to-credit-result"

type SummarizeLicenseFromRowsArgs = {
  readonly license: License
  readonly creditRows: ReadonlyArray<CourseCredit>
  /** Wall-clock reference for selecting the current recurrence window. */
  readonly today: Date
}

/**
 * Reconstruct a license's persisted CourseCredit rows into the rules engine's
 * result shape and run `summarizeLicense`. Returns `null` when no rule set
 * ships for the license's state + license type.
 */
export const summarizeLicenseFromRows = ({
  license,
  creditRows,
  today,
}: SummarizeLicenseFromRowsArgs): ProgressSummary | null => {
  const key = ruleSetKeyFor(license)
  if (key === null) {
    return null
  }
  return summarizeLicense({
    credits: creditRows.map(toCreditResult),
    license: {
      id: license.id,
      issuedAt: new Date(license.issuedAt),
      reactivationDate: license.reactivationDate
        ? new Date(license.reactivationDate)
        : null,
      renewalCycleMonths:
        license.renewalCycleMonths ?? DEFAULT_RENEWAL_CYCLE_MONTHS,
    },
    ruleSet: RULE_SETS[key],
    today,
  })
}
