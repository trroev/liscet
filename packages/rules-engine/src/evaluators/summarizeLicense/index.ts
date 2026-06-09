import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type {
  CategoryProgress,
  ProgressSummary,
} from "@repo/rules-engine/types/ProgressSummary"
import type { RuleSet, SubjectCategory } from "@repo/rules-engine/types/RuleSet"
import { isRequirementEffective } from "@repo/rules-engine/utils/isRequirementEffective"

type SummarizedLicense = {
  readonly id: string
  readonly issuedAt: Date
  readonly renewalCycleMonths: number
  /**
   * Date the license was reactivated after lapsing, if ever. Supersedes
   * `issuedAt` as the date special requirements are gated against.
   */
  readonly reactivationDate?: Date | null
}

type SummarizeLicenseArgs = {
  readonly license: SummarizedLicense
  readonly credits: Array<CourseCreditResult>
  /**
   * Part of the locked summarizeLicense API (callers #26/#24), reserved for
   * future cycle-lapse logic. Every current ProgressSummary field derives from
   * issuedAt, not wall-clock time, so it is intentionally not yet read.
   */
  readonly today: Date
  readonly ruleSet: RuleSet
}

/**
 * Add `months` calendar months to `date` using UTC fields, clamping to the
 * last valid day of the target month (Jan 31 + 1 month → Feb 28/29). UTC keeps
 * the result independent of the host timezone, matching the deterministic,
 * pure-function contract of the rules engine.
 */
function addMonths(date: Date, months: number): Date {
  const targetDay = date.getUTCDate()
  const result = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate()
  result.setUTCDate(Math.min(targetDay, daysInTargetMonth))
  return result
}

/**
 * Aggregate a license's persisted course credits into the live
 * `ProgressSummary` shown on the dashboard. Pure and synchronous — no I/O — and
 * computed on every read rather than persisted.
 *
 * A credit contributes its full `creditedHours` to every category it credits,
 * so one course can advance several category minimums at once; `creditedHours`
 * is summed once for `totalCreditedHours`. `renewsAt` is derived from the
 * license's own `issuedAt` and renewal cycle, never from wall-clock time.
 *
 * Special requirements are gated on the license's renewal/reactivation date:
 * the license's `reactivationDate` when present, otherwise `issuedAt` (the date
 * the licensee entered or re-entered active practice). Only requirements
 * effective as of that date appear in `specialRequirementProgress` and bear on
 * `isComplete`; a requirement whose `effectiveFrom` is later is ignored.
 */
export function summarizeLicense({
  license,
  credits,
  ruleSet,
}: SummarizeLicenseArgs): ProgressSummary {
  const totalCreditedHours = credits.reduce(
    (sum, credit) => sum + credit.creditedHours,
    0
  )

  const creditedHoursIn = (category: SubjectCategory): number =>
    credits
      .filter((credit) => credit.creditedCategories.includes(category))
      .reduce((sum, credit) => sum + credit.creditedHours, 0)

  const categoryProgress: ReadonlyArray<CategoryProgress> =
    ruleSet.categoryMinimums.map((minimum) => ({
      category: minimum.category,
      credited: creditedHoursIn(minimum.category),
      required: minimum.minHours,
    }))

  const gatedAt = license.reactivationDate ?? license.issuedAt
  const specialRequirementProgress: ReadonlyArray<CategoryProgress> =
    ruleSet.specialRequirements
      .filter((requirement) =>
        isRequirementEffective({ requirement, asOf: gatedAt })
      )
      .map((requirement) => ({
        category: requirement.category,
        credited: creditedHoursIn(requirement.category),
        required: requirement.minHours,
      }))

  const meetsMinimum = (progress: CategoryProgress): boolean =>
    progress.credited >= progress.required

  const isComplete =
    totalCreditedHours >= ruleSet.totalHours &&
    categoryProgress.every(meetsMinimum) &&
    specialRequirementProgress.every(meetsMinimum)

  return {
    totalCreditedHours,
    requiredHours: ruleSet.totalHours,
    categoryProgress,
    specialRequirementProgress,
    isComplete,
    renewsAt: addMonths(license.issuedAt, license.renewalCycleMonths),
  }
}
