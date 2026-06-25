import { Button } from "@repo/ui/components/Button"
import Link from "next/link"
import type { CourseView } from "../../lib/types"
import { CourseRow } from "../CourseRow"

export type CoursesListProps = {
  courses: Array<CourseView>
  userSlug: string
}

export const CoursesList = ({
  courses,
  userSlug,
}: CoursesListProps): React.JSX.Element => {
  if (courses.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border border-dashed bg-surface p-6">
        <p className="font-sans text-body-sm text-text-secondary">
          You haven&apos;t logged any courses yet.
        </p>
        <Button
          nativeButton={false}
          render={<Link href={`/${userSlug}/courses/new`} />}
          size="sm"
        >
          Log your first course
        </Button>
      </div>
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
