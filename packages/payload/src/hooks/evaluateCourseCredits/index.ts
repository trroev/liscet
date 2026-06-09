import { createLogger } from "@repo/logger"
import { captureException } from "@repo/observability"
import type { Course, License } from "@repo/payload/payload-types"
import type { CollectionAfterChangeHook } from "payload"
import { creditFor, ruleSetKeyFor } from "./credit-for"
import { type CreditToPersist, reconcileCredits } from "./reconcile-credits"

const log = createLogger({ name: "payload.evaluate-course-credits" })

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

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
      .map((license) => creditFor({ course: doc, evaluatedAt, license }))
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
      .map((course) => creditFor({ course, evaluatedAt, license: doc }))
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
