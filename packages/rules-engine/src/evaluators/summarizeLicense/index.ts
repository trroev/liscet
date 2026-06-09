import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type {
  CategoryProgress,
  ConstraintProgress,
  ProgressSummary,
} from "@repo/rules-engine/types/ProgressSummary"
import type {
  CourseFormat,
  RuleSet,
  SubjectCategory,
} from "@repo/rules-engine/types/RuleSet"
import { addMonths } from "@repo/rules-engine/utils/addMonths"
import { currentRecurrenceWindowStart } from "@repo/rules-engine/utils/currentRecurrenceWindowStart"
import { evaluateConstraint } from "@repo/rules-engine/utils/evaluateConstraint"
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
  /** Wall-clock reference for selecting the current recurrence window. */
  readonly today: Date
  readonly ruleSet: RuleSet
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
 *
 * A recurring special requirement's credit is windowed to its current
 * recurrence period (anchored at the same renewal/reactivation date, selected
 * by `today`): credits earned in a prior window do not count toward the current
 * obligation. The recurrence window is independent of the renewal cycle — they
 * are separate mechanisms (CT-LICSW's 72-month veterans requirement spans six
 * 12-month renewals). One-time requirements, `categoryProgress`, and
 * `totalCreditedHours` are not windowed; per-cycle windowing of categories and
 * the total is a separate concern, deliberately out of scope here.
 */
export function summarizeLicense({
  license,
  credits,
  today,
  ruleSet,
}: SummarizeLicenseArgs): ProgressSummary {
  const totalCreditedHours = credits.reduce(
    (sum, credit) => sum + credit.creditedHours,
    0
  )

  const creditedHoursIn = (
    category: SubjectCategory,
    since: Date | null = null
  ): number =>
    credits
      .filter(
        (credit) =>
          credit.creditedCategories.includes(category) &&
          (since === null || credit.completedAt >= since)
      )
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
        credited: creditedHoursIn(
          requirement.category,
          currentRecurrenceWindowStart({
            recurrence: requirement.recurrence,
            anchor: gatedAt,
            asOf: today,
          })
        ),
        required: requirement.minHours,
      }))

  const creditedHoursForFormats = (
    formats: ReadonlyArray<CourseFormat>
  ): number =>
    credits
      .filter((credit) => formats.includes(credit.format))
      .reduce((sum, credit) => sum + credit.creditedHours, 0)

  const formatConstraintProgress: ReadonlyArray<ConstraintProgress> =
    ruleSet.formatConstraints.map((constraint) =>
      evaluateConstraint({
        kind: constraint.kind,
        creditedHours: creditedHoursForFormats(constraint.formats),
        limitHours:
          constraint.kind === "max-fraction"
            ? constraint.fraction * ruleSet.totalHours
            : constraint.hours,
      })
    )

  const providerCapProgress: ReadonlyArray<ConstraintProgress> =
    ruleSet.providerCaps.map((cap) =>
      evaluateConstraint({
        kind: cap.kind,
        creditedHours: credits
          .filter(
            (credit) =>
              credit.approvingBody !== null &&
              cap.approvingBodies.includes(credit.approvingBody)
          )
          .reduce((sum, credit) => sum + credit.creditedHours, 0),
        limitHours:
          cap.kind === "max-fraction"
            ? cap.fraction * ruleSet.totalHours
            : cap.hours,
      })
    )

  const meetsMinimum = (progress: CategoryProgress): boolean =>
    progress.credited >= progress.required

  // Only `min-hours` constraints block completion; exceeding a `max-*` cap is
  // surfaced via `satisfied` but limits credit rather than eligibility.
  const formatMinimumsMet = formatConstraintProgress.every(
    (progress) => progress.kind !== "min-hours" || progress.satisfied
  )

  const isComplete =
    totalCreditedHours >= ruleSet.totalHours &&
    categoryProgress.every(meetsMinimum) &&
    specialRequirementProgress.every(meetsMinimum) &&
    formatMinimumsMet

  return {
    totalCreditedHours,
    requiredHours: ruleSet.totalHours,
    categoryProgress,
    specialRequirementProgress,
    formatConstraintProgress,
    providerCapProgress,
    isComplete,
    renewsAt: addMonths({
      date: license.issuedAt,
      months: license.renewalCycleMonths,
    }),
  }
}
