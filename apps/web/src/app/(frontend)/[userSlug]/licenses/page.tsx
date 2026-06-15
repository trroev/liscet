import type { Metadata } from "next"
import { LicensesView } from "~/features/licenses/components/LicensesView"
import { getLicensesData } from "~/features/licenses/lib/get-licenses-data"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Licenses",
  robots: { follow: false, index: false },
}

export default async function LicensesPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const { user } = await requireSlugOwner({ userSlug })

  const now = new Date()
  const data = await getLicensesData(user.id)

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Licenses
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Your professional licenses and renewal deadlines.
        </p>
      </header>
      <LicensesView initialData={data} nowIso={now.toISOString()} />
    </section>
  )
}
