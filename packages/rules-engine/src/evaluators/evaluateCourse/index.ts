import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import type { RuleSet, SubjectCategory } from "@repo/rules-engine/types/RuleSet"
import { SUBJECT_CATEGORIES } from "@repo/rules-engine/types/RuleSet"

type EvaluatedLicense = {
  readonly id: string
  readonly renewalCycleStart: Date
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
 * (or negative) hours, or no category that the rule set actually requires.
 */
export function evaluateCourse(
  course: EvaluatedCourse,
  license: EvaluatedLicense,
  ruleSet: RuleSet,
  evaluatedAt: Date
): CourseCreditResult | null {
  if (!ruleSet.acceptedFormats.includes(course.format)) {
    return null
  }

  if (course.hours <= 0) {
    return null
  }

  const mappedCategories = course.subjectCategories
    .map((tag) => tag.trim().toLowerCase())
    .filter(isKnownCategory)

  const requiredCategories = new Set(
    ruleSet.categoryMinimums.map((minimum) => minimum.category)
  )
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
  }
}
