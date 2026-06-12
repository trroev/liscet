import {
  RiAwardLine,
  RiBookOpenLine,
  RiDashboardLine,
  RiSettings3Line,
} from "@remixicon/react"
import {
  AppFrame,
  type AppFrameNavItem,
} from "@repo/chrome/components/AppFrame"
import type { SignedInAuth } from "@repo/types/HeaderAuth"
import type React from "react"
import { signOutAction } from "~/features/auth/actions/sign-out"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { buildInitials } from "~/lib/build-initials"
import { requireOnboardedViewer } from "~/lib/queries/require-onboarded-viewer"

export default async function UserSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, slug } = await requireOnboardedViewer()

  const avatarUrl =
    typeof user.avatar === "object" && user.avatar
      ? (user.avatar.url ?? null)
      : null
  const displayName = user.displayName ?? user.email
  const auth: SignedInAuth = {
    status: "signed-in",
    displayName,
    initials: buildInitials(displayName),
    avatarUrl,
    onSignOut: async () => {
      "use server"
      await signOutAction()
    },
  }

  const navItems: ReadonlyArray<AppFrameNavItem> = [
    {
      href: `/${slug}`,
      icon: <RiDashboardLine aria-hidden className="size-4" />,
      label: "Dashboard",
    },
    {
      href: `/${slug}/licenses`,
      icon: <RiAwardLine aria-hidden className="size-4" />,
      label: "Licenses",
    },
    {
      href: `/${slug}/courses`,
      icon: <RiBookOpenLine aria-hidden className="size-4" />,
      label: "Courses",
    },
    {
      href: `/${slug}/settings`,
      icon: <RiSettings3Line aria-hidden className="size-4" />,
      label: "Settings",
    },
  ]

  return (
    <AppFrame
      auth={auth}
      homeHref={`/${slug}`}
      navItems={navItems}
      themeToggleSlot={<ThemeToggle />}
    >
      {children}
    </AppFrame>
  )
}
