import type {
  ApprovingBody,
  CourseFormat,
  SubjectCategory,
} from "@repo/rules-engine/types/RuleSet"

export type CourseCreditResult = {
  readonly courseId: string
  readonly licenseId: string
  readonly creditedHours: number
  readonly creditedCategories: ReadonlyArray<SubjectCategory>
  readonly ruleSetVersion: number
  readonly evaluatedAt: Date
  /** Course completion date — buckets the credit into a recurrence window. */
  readonly completedAt: Date
  /** Delivery format, for aggregate format-constraint checks. */
  readonly format: CourseFormat
  /** Approving body, for aggregate provider-cap checks; null when unrecognized. */
  readonly approvingBody: ApprovingBody | null
}
