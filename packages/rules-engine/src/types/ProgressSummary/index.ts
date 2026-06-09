import type { SubjectCategory } from "@repo/rules-engine/types/RuleSet"

export type CategoryProgress = {
  readonly category: SubjectCategory
  readonly credited: number
  readonly required: number
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
  readonly isComplete: boolean
  readonly renewsAt: Date
}
