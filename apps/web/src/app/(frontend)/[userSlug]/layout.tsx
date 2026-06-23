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
import type React from "react"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { buildSignedInAuth } from "~/lib/header-auth"
import { requireViewer } from "~/lib/queries/current-viewer"

export default async function UserSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, slug } = await requireViewer({ onboarded: true })

  const auth = buildSignedInAuth({
    displayName: user.displayName ?? user.email,
    avatar: user.avatar,
  })

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
      profileHref={`/${slug}/settings/account`}
      themeToggleSlot={<ThemeToggle />}
    >
      {children}
    </AppFrame>
  )
}
