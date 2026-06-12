import type { Metadata } from "next"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Settings",
  robots: { follow: false, index: false },
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  await requireSlugOwner({ userSlug })

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Settings
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Profile, account, and data controls.
        </p>
      </header>
      <p className="rounded-lg border border-border border-dashed bg-surface p-6 text-body-sm text-text-secondary">
        Settings are coming soon.
      </p>
    </section>
  )
}
