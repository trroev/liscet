import type { Metadata } from "next"
import { CoursesList } from "~/features/courses/components/CoursesList"
import { getCoursesData } from "~/features/courses/lib/get-courses-data"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Courses",
  robots: { follow: false, index: false },
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const { user } = await requireSlugOwner({ userSlug })

  const data = await getCoursesData(user.id)

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Courses
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Your logged continuing-education courses and the credits they earned.
        </p>
      </header>
      <CoursesList courses={data.courses} />
    </section>
  )
}
