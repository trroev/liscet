import type { CourseCredit } from "@repo/payload/payload-types"
import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type {
  ApprovingBody,
  CourseFormat,
  SubjectCategory,
} from "@repo/rules-engine/types/RuleSet"

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

/**
 * Reconstruct a persisted CourseCredit row into the rules engine's result
 * shape. CourseCredits are written by the engine with validated union values;
 * the persisted columns widen to `string`, so narrow them back here.
 */
export const toCreditResult = (row: CourseCredit): CourseCreditResult => ({
  approvingBody: (row.approvingBody ?? null) as ApprovingBody | null,
  completedAt: new Date(row.completedAt),
  courseId: refId(row.course),
  creditedCategories: (row.creditedCategories ??
    []) as ReadonlyArray<SubjectCategory>,
  creditedHours: row.creditedHours,
  evaluatedAt: new Date(row.evaluatedAt),
  format: row.format as CourseFormat,
  licenseId: refId(row.license),
  ruleSetVersion: row.ruleSetVersion,
})
