import { createLogger } from "@repo/logger"
import { captureException, scopeSentry } from "@repo/observability"
import { creditCourseForLicense, ruleSetKeyFor } from "@repo/payload/evaluation"
import type { Course, License } from "@repo/payload/payload-types"
import { practitionerData } from "@repo/payload/queries/practitioner-data"
import type { CollectionAfterChangeHook } from "payload"
import { type CreditToPersist, reconcileCredits } from "./reconcile-credits"

const log = createLogger({ name: "payload.evaluate-course-credits" })

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

export const evaluateCourseCreditsOnCourseChange: CollectionAfterChangeHook<
  Course
> = async ({ doc, req }) => {
  try {
    const { payload } = req
    scopeSentry({ practitionerId: refId(doc.practitioner) })
    const licenses = await practitionerData({
      payload,
      practitionerId: refId(doc.practitioner),
      req,
    }).activeLicenses()
    const evaluatedAt = new Date()
    const credits = licenses
      .map((license) =>
        creditCourseForLicense({ course: doc, evaluatedAt, license })
      )
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
    scopeSentry({
      license: { licenseType: doc.licenseType, state: doc.state },
      practitionerId: refId(doc.practitioner),
    })
    const scope = { license: { equals: doc.id } }
    if (doc.status !== "active" || ruleSetKeyFor(doc) === null) {
      await reconcileCredits({ credits: [], payload, req, scope })
      return doc
    }
    const courses = await practitionerData({
      payload,
      practitionerId: refId(doc.practitioner),
      req,
    }).courses()
    const evaluatedAt = new Date()
    const credits = courses
      .map((course) =>
        creditCourseForLicense({ course, evaluatedAt, license: doc })
      )
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
