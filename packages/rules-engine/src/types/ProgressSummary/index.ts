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
  readonly isComplete: boolean
  readonly renewsAt: Date
}
