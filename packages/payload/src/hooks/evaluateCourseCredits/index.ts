import { createLogger } from "@repo/logger"
import { captureException } from "@repo/observability"
import type { Course, License } from "@repo/payload/payload-types"
import { evaluateCourse } from "@repo/rules-engine/evaluators/evaluateCourse"
import { RULE_SETS, type RuleSetKey } from "@repo/rules-engine/rule-sets"
import type { CollectionAfterChangeHook } from "payload"
import { deriveRenewalCycleStart } from "./derive-renewal-cycle-start"
import { type CreditToPersist, reconcileCredits } from "./reconcile-credits"
import { toEvaluatedCourse } from "./to-evaluated-course"

const log = createLogger({ name: "payload.evaluate-course-credits" })

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

const ruleSetKeyFor = (license: License): RuleSetKey | null => {
  const key = `${license.state}-${license.licenseType}`
  return key in RULE_SETS ? (key as RuleSetKey) : null
}

const creditFor = (
  license: License,
  course: Course,
  evaluatedAt: Date
): CreditToPersist | null => {
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
    courseId: result.courseId,
    creditedCategories: result.creditedCategories,
    creditedHours: result.creditedHours,
    evaluatedAt: result.evaluatedAt,
    licenseId: result.licenseId,
    ruleSetKey: key,
    ruleSetVersion: result.ruleSetVersion,
  }
}

export const evaluateCourseCreditsOnCourseChange: CollectionAfterChangeHook<
  Course
> = async ({ doc, req }) => {
  try {
    const { payload } = req
    const licenses = await payload.find({
      collection: "licenses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [
          { practitioner: { equals: refId(doc.practitioner) } },
          { status: { equals: "active" } },
        ],
      },
    })
    const evaluatedAt = new Date()
    const credits = licenses.docs
      .map((license) => creditFor(license, doc, evaluatedAt))
      .filter((credit): credit is CreditToPersist => credit !== null)
    await reconcileCredits({
      credits,
      payload,
      req,
      scope: { course: { equals: doc.id } },
    })
  } catch (err) {
    log
      .withError(err)
      .error("Failed to evaluate course credits on course change")
    captureException(err)
  }
  return doc
}

export const evaluateCourseCreditsOnLicenseChange: CollectionAfterChangeHook<
  License
> = async ({ doc, req }) => {
  try {
    const { payload } = req
    const scope = { license: { equals: doc.id } }
    if (doc.status !== "active" || ruleSetKeyFor(doc) === null) {
      await reconcileCredits({ credits: [], payload, req, scope })
      return doc
    }
    const courses = await payload.find({
      collection: "courses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      where: { practitioner: { equals: refId(doc.practitioner) } },
    })
    const evaluatedAt = new Date()
    const credits = courses.docs
      .map((course) => creditFor(doc, course, evaluatedAt))
      .filter((credit): credit is CreditToPersist => credit !== null)
    await reconcileCredits({ credits, payload, req, scope })
  } catch (err) {
    log
      .withError(err)
      .error("Failed to evaluate course credits on license change")
    captureException(err)
  }
  return doc
}
