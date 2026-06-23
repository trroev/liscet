"use client"

import { useRouter } from "next/navigation"
import { logCourse } from "../../actions/log-course"
import type { LogCourseInput, LogCourseResult } from "../../lib/types"
import { LogCourseFormView } from "./log-course-form.view"

export type LogCourseFormProps = {
  userSlug: string
  onSubmit?: (input: LogCourseInput) => Promise<LogCourseResult>
}

const submitViaFormData = (input: LogCourseInput): Promise<LogCourseResult> => {
  const formData = new FormData()
  formData.set("title", input.title)
  if (input.provider) {
    formData.set("provider", input.provider)
  }
  formData.set("completedAt", input.completedAt)
  formData.set("hours", String(input.hours))
  formData.set("format", input.format)
  for (const category of input.subjectCategories) {
    formData.append("subjectCategories", category)
  }
  if (input.certificate) {
    formData.set("certificate", input.certificate)
  }
  return logCourse(formData)
}

export const LogCourseForm = ({
  userSlug,
  onSubmit = submitViaFormData,
}: LogCourseFormProps): React.JSX.Element => {
  const router = useRouter()
  return (
    <LogCourseFormView
      onSubmit={onSubmit}
      onSuccess={() => {
        router.push(`/${userSlug}`)
      }}
    />
  )
}
