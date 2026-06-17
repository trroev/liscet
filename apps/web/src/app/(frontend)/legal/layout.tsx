import { AppShell } from "@repo/chrome/components/AppShell"
import type React from "react"
import { ThemeToggle } from "~/features/settings/components/ThemeToggle"
import { resolveHeaderAuth } from "~/lib/header-auth"

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const headerAuth = await resolveHeaderAuth()

  return (
    <AppShell auth={headerAuth} themeToggleSlot={<ThemeToggle />}>
      {children}
    </AppShell>
  )
}
