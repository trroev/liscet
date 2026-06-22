import { createLogger } from "@repo/logger"
import { captureException, scopeSentry } from "@repo/observability"
import { recreditScope } from "@repo/payload/evaluation"
import type { Course, License } from "@repo/payload/payload-types"
import type { CollectionAfterChangeHook } from "payload"

const log = createLogger({ name: "payload.evaluate-course-credits" })

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

export const evaluateCourseCreditsOnCourseChange: CollectionAfterChangeHook<
  Course
> = async ({ doc, req }) => {
  try {
    scopeSentry({ practitionerId: refId(doc.practitioner) })
    await recreditScope({
      payload: req.payload,
      req,
      scope: { course: doc, type: "course" },
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
    scopeSentry({
      license: { licenseType: doc.licenseType, state: doc.state },
      practitionerId: refId(doc.practitioner),
    })
    await recreditScope({
      payload: req.payload,
      req,
      scope: { license: doc, type: "license" },
    })
  } catch (err) {
    log
      .withError(err)
      .error("Failed to evaluate course credits on license change")
    captureException(err)
  }
  return doc
}
