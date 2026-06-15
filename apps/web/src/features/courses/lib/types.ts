import type { Course } from "@repo/payload/payload-types"
import type { ActionResult } from "@repo/types/ActionResult"
import type { LogCourseValues } from "./schema"

export type LogCourseInput = LogCourseValues & {
  certificate?: File | null
}

export type LogCourseData = {
  courseId: string
}

export type LogCourseResult = ActionResult<LogCourseData>

export type CourseCreditView = {
  id: string
  licenseLabel: string
  licenseNumber: string
  creditedHours: number
  creditedCategories: Array<string>
}

export type CourseView = {
  id: string
  title: string
  provider: string | null
  completedAt: string
  hours: number
  format: Course["format"]
  subjectCategories: Array<string>
  hasCertificate: boolean
  credits: Array<CourseCreditView>
}

export type CoursesData = {
  courses: Array<CourseView>
}

export type CertificateUrlData = {
  url: string
}

export type CertificateUrlResult = ActionResult<CertificateUrlData>
