import { redirect } from "next/navigation"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}): Promise<never> {
  const { userSlug } = await params
  const { slug } = await requireSlugOwner({ userSlug })
  redirect(`/${slug}/settings/account`)
}
