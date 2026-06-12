import type { Metadata } from "next"
import { PreferencesPane } from "~/features/settings/components/PreferencesPane"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Preferences",
}

export default async function PreferencesSettingsPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  await requireSlugOwner({ userSlug })

  return <PreferencesPane />
}
