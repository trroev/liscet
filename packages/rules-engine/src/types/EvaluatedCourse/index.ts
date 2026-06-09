import type { CourseFormat } from "@repo/rules-engine/types/RuleSet"

export type EvaluatedCourse = {
  readonly courseId: string
  readonly completedAt: Date
  readonly hours: number
  readonly format: CourseFormat
  // Raw, unnormalized tags from Courses; the evaluator maps these to SubjectCategory.
  readonly subjectCategories: ReadonlyArray<string>
  // Raw, unnormalized provider from Courses; the evaluator maps it to ApprovingBody.
  readonly approvingBody?: string | null
}
