import type { Metadata } from "next"
import type React from "react"
import { SettingsNav } from "~/features/settings/components/SettingsNav"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Settings",
  robots: { follow: false, index: false },
}

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const { slug } = await requireSlugOwner({ userSlug })

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-heading-lg text-text-primary">
          Settings
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Profile, account, and data controls.
        </p>
      </header>
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="shrink-0 md:w-44">
          <SettingsNav userSlug={slug} />
        </aside>
        <div className="min-w-0 max-w-3xl flex-1">{children}</div>
      </div>
    </section>
  )
}
