import type { Course, CourseCredit, License } from "@repo/payload/payload-types"
import type { Payload, PayloadRequest } from "payload"

type PractitionerDataArgs = {
  readonly payload: Payload
  readonly practitionerId: string
  /**
   * Pass the hook's `req` so reads run inside the same transaction as the
   * mutation that triggered them. Omitted by request-time reads.
   */
  readonly req?: PayloadRequest
}

type PractitionerData = {
  readonly activeLicenses: () => Promise<Array<License>>
  readonly licenses: () => Promise<Array<License>>
  readonly courses: () => Promise<Array<Course>>
  readonly creditsForLicense: (
    licenseId: string
  ) => Promise<Array<CourseCredit>>
  readonly creditsForCourses: (
    courseIds: ReadonlyArray<string>
  ) => Promise<Array<CourseCredit>>
}

/**
 * The single seam for reading a practitioner's owned records. The ownership
 * predicate (`practitioner` equals) and the `overrideAccess` escape live here
 * and nowhere else; callers compose these methods instead of hand-writing
 * `payload.find`. Reachable from request-time reads, Payload hooks, and the
 * reevaluate CLI — each supplies its own `payload` (and `req` when inside a
 * mutation transaction).
 */
export const practitionerData = ({
  payload,
  practitionerId,
  req,
}: PractitionerDataArgs): PractitionerData => ({
  activeLicenses: async () => {
    const result = await payload.find({
      collection: "licenses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [
          { practitioner: { equals: practitionerId } },
          { status: { equals: "active" } },
        ],
      },
    })
    return result.docs
  },

  licenses: async () => {
    const result = await payload.find({
      collection: "licenses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      sort: "expiresAt",
      where: { practitioner: { equals: practitionerId } },
    })
    return result.docs
  },

  courses: async () => {
    const result = await payload.find({
      collection: "courses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      sort: "-completedAt",
      where: { practitioner: { equals: practitionerId } },
    })
    return result.docs
  },

  creditsForLicense: async (licenseId: string) => {
    const result = await payload.find({
      collection: "course-credits",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req,
      where: { license: { equals: licenseId } },
    })
    return result.docs
  },

  creditsForCourses: async (courseIds: ReadonlyArray<string>) => {
    if (courseIds.length === 0) {
      return []
    }
    const result = await payload.find({
      collection: "course-credits",
      depth: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: { course: { in: [...courseIds] } },
    })
    return result.docs
  },
})
