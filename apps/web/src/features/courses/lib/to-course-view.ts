import type { Course, CourseCredit } from "@repo/payload/payload-types"
import type { CourseCreditView, CourseView } from "./types"

const toCourseCreditView = (credit: CourseCredit): CourseCreditView => {
  const license = typeof credit.license === "object" ? credit.license : null

  return {
    creditedCategories: credit.creditedCategories ?? [],
    creditedHours: credit.creditedHours,
    id: credit.id,
    licenseLabel: license
      ? `${license.state} ${license.licenseType}`
      : "License",
    licenseNumber: license?.licenseNumber ?? "",
  }
}

export const toCourseView = ({
  course,
  credits,
}: {
  course: Course
  credits: Array<CourseCredit>
}): CourseView => ({
  completedAt: course.completedAt,
  credits: credits.map(toCourseCreditView),
  format: course.format,
  hasCertificate: course.certificate != null,
  hours: course.hours,
  id: course.id,
  provider: course.provider ?? null,
  subjectCategories: course.subjectCategories ?? [],
  title: course.title,
})
