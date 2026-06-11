import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getPayload } from "payload"
import { DashboardView } from "~/features/dashboard/components/DashboardView"
import { getDashboardData } from "~/features/dashboard/lib/get-dashboard-data"
import { requireOnboardedViewer } from "~/lib/queries/require-onboarded-viewer"
import config from "~/payload.config"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { follow: false, index: false },
}

const slugBelongsToAnotherUser = async (slug: string): Promise<boolean> => {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return existing.totalDocs > 0
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const { user, slug } = await requireOnboardedViewer()

  if (userSlug !== slug) {
    if (await slugBelongsToAnotherUser(userSlug)) {
      redirect(`/${slug}`)
    }
    notFound()
  }

  const now = new Date()
  const data = await getDashboardData(user.id, now)

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Dashboard
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Your continuing-education progress toward each license renewal.
        </p>
      </header>
      <DashboardView
        initialData={data}
        nowIso={now.toISOString()}
        userSlug={slug}
      />
    </section>
  )
}
