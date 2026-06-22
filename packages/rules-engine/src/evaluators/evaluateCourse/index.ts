import type { CourseCreditResult } from "@repo/rules-engine/types/CourseCreditResult"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"
import type {
  ApprovingBody,
  RuleSet,
  SubjectCategory,
} from "@repo/rules-engine/types/RuleSet"
import {
  APPROVING_BODIES,
  SUBJECT_CATEGORIES,
} from "@repo/rules-engine/types/RuleSet"
import { addMonths } from "@repo/rules-engine/utils/addMonths"

type EvaluatedLicense = {
  readonly id: string
  /** License expiry; the renewal cycle ends here and is measured back from it. */
  readonly expiresAt: Date
  /**
   * Cycle length in months. Falls back to the rule set's own
   * `renewalCycleMonths` when unset — the rule set owns the authoritative
   * length, not a global default.
   */
  readonly renewalCycleMonths?: number | null
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

const KNOWN_APPROVING_BODIES: ReadonlySet<ApprovingBody> = new Set(
  APPROVING_BODIES
)

const toApprovingBody = (
  provider: string | null | undefined
): ApprovingBody | null => {
  const normalized = provider?.trim().toUpperCase()
  return normalized && KNOWN_APPROVING_BODIES.has(normalized as ApprovingBody)
    ? (normalized as ApprovingBody)
    : null
}

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

  const renewalCycleStart = addMonths({
    date: license.expiresAt,
    months: -(license.renewalCycleMonths ?? ruleSet.renewalCycleMonths),
  })

  // Courses completed before the cycle started are carried over from the prior
  // cycle and capped when the rule set sets a cap.
  const isCarriedOver = course.completedAt < renewalCycleStart
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
    format: course.format,
    approvingBody: toApprovingBody(course.approvingBody),
  }
}
