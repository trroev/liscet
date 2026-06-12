import { AppShell } from "@repo/chrome/components/AppShell"
import type { HeaderAuth } from "@repo/types/HeaderAuth"
import { headers } from "next/headers"
import type React from "react"
import { signOutAction } from "~/features/auth/actions/sign-out"
import { auth } from "~/features/auth/auth.server"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { buildInitials } from "~/lib/build-initials"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  let headerAuth: HeaderAuth = { status: "anonymous" }
  if (session) {
    const payloadUser = await getPayloadUserByBetterAuthId(session.user.id)
    const avatarUrl =
      payloadUser &&
      typeof payloadUser.avatar === "object" &&
      payloadUser.avatar
        ? (payloadUser.avatar.url ?? null)
        : null
    const displayName = session.user.name ?? session.user.email
    headerAuth = {
      status: "signed-in",
      displayName,
      initials: buildInitials(displayName),
      avatarUrl,
      onSignOut: async () => {
        "use server"
        await signOutAction()
      },
    }
  }

  return (
    <AppShell auth={headerAuth} themeToggleSlot={<ThemeToggle />}>
      {children}
    </AppShell>
  )
}
