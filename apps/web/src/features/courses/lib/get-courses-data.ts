import "server-only"

import type { CourseCredit } from "@repo/payload/payload-types"
import { practitionerData } from "@repo/payload/queries/practitioner-data"
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
  const data = practitionerData({ payload, practitionerId })

  const courses = await data.courses()
  const credits = await data.creditsForCourses(
    courses.map((course) => course.id)
  )

  const creditsByCourse = new Map<string, Array<CourseCredit>>()
  for (const credit of credits) {
    const courseId =
      typeof credit.course === "object" ? credit.course.id : credit.course
    const existing = creditsByCourse.get(courseId) ?? []
    existing.push(credit)
    creditsByCourse.set(courseId, existing)
  }

  return {
    courses: courses.map((course) =>
      toCourseView({
        course,
        credits: creditsByCourse.get(course.id) ?? [],
      })
    ),
  }
}
