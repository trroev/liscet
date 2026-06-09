import type { SubjectCategory } from "@repo/rules-engine/types/RuleSet"

export type CategoryProgress = {
  readonly category: SubjectCategory
  readonly credited: number
  readonly required: number
}

/**
 * Result of an aggregate hour constraint (a format constraint or a provider
 * cap). `limitHours` is the threshold in hours (a `max-fraction` resolves to
 * `fraction × requiredHours`); `satisfied` is `credited ≥ limit` for
 * `min-hours`, `credited ≤ limit` for the `max-*` kinds.
 */
export type ConstraintProgress = {
  readonly kind: "min-hours" | "max-hours" | "max-fraction"
  readonly creditedHours: number
  readonly limitHours: number
  readonly satisfied: boolean
}

export type ProgressSummary = {
  readonly totalCreditedHours: number
  readonly requiredHours: number
  readonly categoryProgress: ReadonlyArray<CategoryProgress>
  /**
   * Per-category progress for the rule set's special requirements that are in
   * force for this license (gated on its renewal/reactivation date). Kept
   * distinct from `categoryProgress` because special requirements are
   * conditional and may recur; an unmet entry here keeps `isComplete` false.
   */
  readonly specialRequirementProgress: ReadonlyArray<CategoryProgress>
  /**
   * Aggregate format-constraint results (credited hours by delivery format). An
   * unmet `min-hours` constraint keeps `isComplete` false; an exceeded `max-*`
   * cap is surfaced (`satisfied: false`) but does not block completion.
   */
  readonly formatConstraintProgress: ReadonlyArray<ConstraintProgress>
  /**
   * Aggregate provider-cap results (credited hours by approving body). All
   * provider caps are `max-*`, so they surface excess but never block
   * `isComplete`.
   */
  readonly providerCapProgress: ReadonlyArray<ConstraintProgress>
  readonly isComplete: boolean
  readonly renewsAt: Date
}
