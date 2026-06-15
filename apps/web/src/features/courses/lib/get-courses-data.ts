import "server-only"

import type { CourseCredit } from "@repo/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"
import { toCourseView } from "./to-course-view"
import type { CoursesData } from "./types"

/**
 * Read every course a practitioner has logged, newest completion first, along
 * with the CourseCredits each course earned per license. Ownership is enforced
 * by the caller (page guard / server action); reads run with overrideAccess.
 */
export const getCoursesData = async (
  practitionerId: string
): Promise<CoursesData> => {
  const payload = await getPayload({ config })

  const courseResult = await payload.find({
    collection: "courses",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    sort: "-completedAt",
    where: { practitioner: { equals: practitionerId } },
  })

  const courseIds = courseResult.docs.map((course) => course.id)
  const creditResult = courseIds.length
    ? await payload.find({
        collection: "course-credits",
        depth: 1,
        overrideAccess: true,
        pagination: false,
        where: { course: { in: courseIds } },
      })
    : { docs: [] as Array<CourseCredit> }

  const creditsByCourse = new Map<string, Array<CourseCredit>>()
  for (const credit of creditResult.docs) {
    const courseId =
      typeof credit.course === "object" ? credit.course.id : credit.course
    const existing = creditsByCourse.get(courseId) ?? []
    existing.push(credit)
    creditsByCourse.set(courseId, existing)
  }

  return {
    courses: courseResult.docs.map((course) =>
      toCourseView({
        course,
        credits: creditsByCourse.get(course.id) ?? [],
      })
    ),
  }
}
