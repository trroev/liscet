import type { CourseView } from "../../lib/types"
import { CourseRow } from "../CourseRow"

export type CoursesListProps = {
  courses: Array<CourseView>
}

export const CoursesList = ({
  courses,
}: CoursesListProps): React.JSX.Element => {
  if (courses.length === 0) {
    return (
      <p className="rounded-lg border border-border border-dashed bg-surface p-6 font-sans text-body-sm text-text-secondary">
        You haven&apos;t logged any courses yet.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {courses.map((course) => (
        <CourseRow course={course} key={course.id} />
      ))}
    </div>
  )
}
