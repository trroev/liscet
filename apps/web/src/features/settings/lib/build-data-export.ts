import "server-only"

import type {
  Course,
  CourseCredit,
  License,
  User,
} from "@repo/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

export type DataExport = {
  exportedAt: string
  user: {
    displayName: string | null
    email: string
    slug: string | null
    timezone: string | null
  }
  licenses: Array<License>
  courses: Array<Course & { credits: Array<CourseCredit> }>
}

/**
 * Builds the practitioner's full data dump: profile fields, every license,
 * and every course with its course-credits nested under the owning course
 * (each credit keeps its `license` id reference).
 */
export const buildDataExport = async ({
  user,
}: {
  user: User
}): Promise<DataExport> => {
  const payload = await getPayload({ config })

  const [licenses, courses] = await Promise.all([
    payload.find({
      collection: "licenses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      where: { practitioner: { equals: user.id } },
    }),
    payload.find({
      collection: "courses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      where: { practitioner: { equals: user.id } },
    }),
  ])

  const courseIds = courses.docs.map((course) => course.id)
  const credits =
    courseIds.length > 0
      ? await payload.find({
          collection: "course-credits",
          depth: 0,
          overrideAccess: true,
          pagination: false,
          where: { course: { in: courseIds } },
        })
      : { docs: [] as Array<CourseCredit> }

  const creditsByCourseId = new Map<string, Array<CourseCredit>>()
  for (const credit of credits.docs) {
    const courseId = refId(credit.course)
    const existing = creditsByCourseId.get(courseId) ?? []
    existing.push(credit)
    creditsByCourseId.set(courseId, existing)
  }

  return {
    exportedAt: new Date().toISOString(),
    user: {
      displayName: user.displayName ?? null,
      email: user.email,
      slug: user.slug ?? null,
      timezone: user.timezone ?? null,
    },
    licenses: licenses.docs,
    courses: courses.docs.map((course) => ({
      ...course,
      credits: creditsByCourseId.get(course.id) ?? [],
    })),
  }
}
