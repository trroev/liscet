import type { Metadata } from "next"
import { LogCourseForm } from "~/features/courses/components/LogCourseForm"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Log a course",
  robots: { follow: false, index: false },
}

export default async function LogCoursePage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  await requireSlugOwner({ userSlug })

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Log a course
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Record a continuing-education course. Credits update on your dashboard
          once saved.
        </p>
      </header>
      <LogCourseForm userSlug={userSlug} />
    </section>
  )
}
