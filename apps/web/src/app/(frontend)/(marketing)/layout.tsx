import { AppShell } from "@repo/chrome/components/AppShell"
import type React from "react"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { resolveHeaderAuth } from "~/lib/header-auth"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerAuth = await resolveHeaderAuth()

  return (
    <AppShell auth={headerAuth} themeToggleSlot={<ThemeToggle />}>
      {children}
    </AppShell>
  )
}
