import type { Course } from "@repo/payload/payload-types"
import type { EvaluatedCourse } from "@repo/rules-engine/types/EvaluatedCourse"

export function toEvaluatedCourse(course: Course): EvaluatedCourse {
  return {
    courseId: course.id,
    completedAt: new Date(course.completedAt),
    hours: course.hours,
    format: course.format,
    subjectCategories: course.subjectCategories ?? [],
  }
}
