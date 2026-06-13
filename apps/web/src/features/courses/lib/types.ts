import type { ActionResult } from "@repo/types/ActionResult"
import type { LogCourseValues } from "./schema"

export type LogCourseInput = LogCourseValues & {
  certificate?: File | null
}

export type LogCourseData = {
  courseId: string
}

export type LogCourseResult = ActionResult<LogCourseData>
