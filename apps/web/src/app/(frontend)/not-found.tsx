import {
  AppShell,
  type MarketingNavLink,
} from "@repo/chrome/components/AppShell"
import type React from "react"
import { NotFoundView } from "~/components/NotFoundView"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { resolveHeaderAuth } from "~/lib/header-auth"

const MARKETING_NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const satisfies ReadonlyArray<MarketingNavLink>

export default async function NotFound(): Promise<React.JSX.Element> {
  const headerAuth = await resolveHeaderAuth()

  return (
    <AppShell
      auth={headerAuth}
      navLinks={MARKETING_NAV_LINKS}
      themeToggleSlot={<ThemeToggle />}
    >
      <NotFoundView />
    </AppShell>
  )
}
