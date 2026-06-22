import type { CreditToPersist } from "@repo/payload/hooks/evaluateCourseCredits/reconcile-credits"
import type { Course, License } from "@repo/payload/payload-types"
import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import { RULE_SETS } from "@repo/rules-engine/rule-sets"
import { ruleSetKeyFor } from "./rule-set-key"
import { toEvaluatedCourse } from "./to-evaluated-course"

type CreditCourseForLicenseArgs = {
  readonly license: License
  readonly course: Course
  readonly evaluatedAt: Date
}

/**
 * Evaluate a single course against a single license and shape the result for
 * persistence. Returns `null` when the license has no shipped rule set or the
 * course earns no credit. Shared by the `afterChange` hooks and the
 * `rules:reevaluate` CLI so both apply identical evaluation logic.
 */
export const creditCourseForLicense = ({
  license,
  course,
  evaluatedAt,
}: CreditCourseForLicenseArgs): CreditToPersist | null => {
  const key = ruleSetKeyFor(license)
  if (key === null) {
    return null
  }
  const result = evaluateCourse({
    course: toEvaluatedCourse(course),
    evaluatedAt,
    license: {
      id: license.id,
      expiresAt: new Date(license.expiresAt),
      renewalCycleMonths: license.renewalCycleMonths,
    },
    ruleSet: RULE_SETS[key],
  })
  if (result === null) {
    return null
  }
  return {
    approvingBody: result.approvingBody,
    completedAt: result.completedAt,
    courseId: result.courseId,
    creditedCategories: result.creditedCategories,
    creditedHours: result.creditedHours,
    evaluatedAt: result.evaluatedAt,
    format: result.format,
    licenseId: result.licenseId,
    ruleSetKey: key,
    ruleSetVersion: result.ruleSetVersion,
  }
}
