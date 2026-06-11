import type { Course, License } from "@repo/payload/payload-types"
import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import { RULE_SETS, type RuleSetKey } from "@repo/rules-engine/rule-sets"
import { deriveRenewalCycleStart } from "./derive-renewal-cycle-start"
import type { CreditToPersist } from "./reconcile-credits"
import { toEvaluatedCourse } from "./to-evaluated-course"

type CreditForArgs = {
  readonly license: License
  readonly course: Course
  readonly evaluatedAt: Date
}

export const ruleSetKeyFor = (license: License): RuleSetKey | null => {
  const key = `${license.state}-${license.licenseType}`
  return key in RULE_SETS ? (key as RuleSetKey) : null
}

/**
 * Evaluate a single course against a single license and shape the result for
 * persistence. Returns `null` when the license has no shipped rule set or the
 * course earns no credit. Shared by the `afterChange` hooks and the
 * `rules:reevaluate` CLI so both apply identical evaluation logic.
 */
export const creditFor = ({
  license,
  course,
  evaluatedAt,
}: CreditForArgs): CreditToPersist | null => {
  const key = ruleSetKeyFor(license)
  if (key === null) {
    return null
  }
  const result = evaluateCourse({
    course: toEvaluatedCourse(course),
    evaluatedAt,
    license: {
      id: license.id,
      renewalCycleStart: deriveRenewalCycleStart(license),
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
