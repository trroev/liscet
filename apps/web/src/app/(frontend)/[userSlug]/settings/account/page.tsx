import type { Metadata } from "next"
import { SignOutButton } from "~/features/auth/components/SignOutButton"
import { AccountPane } from "~/features/settings/components/AccountPane"
import { requireSlugOwner } from "~/lib/queries/require-slug-owner"

export const metadata: Metadata = {
  title: "Account settings",
}

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const { session, user } = await requireSlugOwner({ userSlug })

  const avatarUrl =
    typeof user.avatar === "object" && user.avatar
      ? (user.avatar.url ?? null)
      : null

  return (
    <AccountPane
      avatarUrl={avatarUrl}
      deletedAt={user.deletedAt ? new Date(user.deletedAt) : null}
      email={session.email}
      memberSince={new Date(session.createdAt)}
      signOutSlot={<SignOutButton />}
    />
  )
}
