import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import type { RuleSet, SubjectCategory } from "@repo/rules-engine/types/RuleSet"
import { SUBJECT_CATEGORIES } from "@repo/rules-engine/types/RuleSet"

type EvaluatedLicense = {
  readonly id: string
  readonly renewalCycleStart: Date
}

type EvaluateCourseArgs = {
  readonly course: EvaluatedCourse
  readonly license: EvaluatedLicense
  readonly ruleSet: RuleSet
  readonly evaluatedAt: Date
}

const KNOWN_CATEGORIES: ReadonlySet<SubjectCategory> = new Set(
  SUBJECT_CATEGORIES
)

const isKnownCategory = (tag: string): tag is SubjectCategory =>
  KNOWN_CATEGORIES.has(tag as SubjectCategory)

/**
 * Decide whether a single completed course earns credit toward a license under
 * a given rule set, and how much. Pure and synchronous — no I/O, no side
 * effects; `evaluatedAt` is injected so the result is deterministic.
 *
 * Returns `null` when the course does not qualify: an ineligible format, zero
 * (or negative) hours, or no category the rule set requires — as a category
 * minimum or a special requirement. A special-requirement category earns credit
 * here regardless of its `effectiveFrom`; effectiveness gates the *minimum*
 * (in `summarizeLicense`), not whether the hours count at all.
 */
export function evaluateCourse({
  course,
  license,
  ruleSet,
  evaluatedAt,
}: EvaluateCourseArgs): CourseCreditResult | null {
  if (!ruleSet.acceptedFormats.includes(course.format)) {
    return null
  }

  if (course.hours <= 0) {
    return null
  }

  const mappedCategories = course.subjectCategories
    .map((tag) => tag.trim().toLowerCase())
    .filter(isKnownCategory)

  const requiredCategories = new Set<SubjectCategory>([
    ...ruleSet.categoryMinimums.map((minimum) => minimum.category),
    ...ruleSet.specialRequirements.map((requirement) => requirement.category),
  ])
  const creditedCategories = [...new Set(mappedCategories)].filter((category) =>
    requiredCategories.has(category)
  )
  if (creditedCategories.length === 0) {
    return null
  }

  // Courses completed before the cycle started are carried over from the prior
  // cycle and capped when the rule set sets a cap.
  const isCarriedOver = course.completedAt < license.renewalCycleStart
  const creditedHours =
    isCarriedOver && ruleSet.carryOverMaxHours !== null
      ? Math.min(course.hours, ruleSet.carryOverMaxHours)
      : course.hours

  return {
    courseId: course.courseId,
    licenseId: license.id,
    creditedHours,
    creditedCategories,
    ruleSetVersion: ruleSet.version,
    evaluatedAt,
    completedAt: course.completedAt,
  }
}
