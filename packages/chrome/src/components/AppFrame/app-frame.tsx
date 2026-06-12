import {
  DetailPanel,
  DetailPanelProvider,
  DetailPanelTrigger,
} from "@repo/chrome/components/DetailPanel"
import type { SignedInAuth } from "@repo/types/HeaderAuth"
import Link from "next/link"
import type React from "react"
import { AppFrameMobileNav } from "./app-frame-mobile-nav"
import { AppFrameNav, type AppFrameNavItem } from "./app-frame-nav"
import { AppFrameUserMenu } from "./app-frame-user-menu"

export type AppFrameProps = {
  auth: SignedInAuth
  children: React.ReactNode
  homeHref: string
  navItems: ReadonlyArray<AppFrameNavItem>
  themeToggleSlot?: React.ReactNode
}

/**
 * Linear-style inverted-L shell for authenticated product screens: a dim left
 * sidebar (primary nav + user menu), a compact top bar (theme toggle + detail
 * panel trigger), and a right slide-in detail panel that screens fill via
 * `DetailPanelContent`. Nav items are data-driven — the frame holds no route
 * knowledge. The marketing `AppShell` remains the chrome for public routes.
 */
export const AppFrame = ({
  auth,
  children,
  homeHref,
  navItems,
  themeToggleSlot,
}: AppFrameProps) => (
  <DetailPanelProvider>
    <div className="flex h-dvh w-full overflow-hidden">
      <aside className="hidden w-56 shrink-0 flex-col border-border border-r bg-surface md:flex">
        <div className="flex h-12 shrink-0 items-center px-4">
          <Link
            className="font-display font-semibold text-body text-text-primary"
            href={homeHref}
          >
            Liscet
          </Link>
        </div>
        <AppFrameNav
          className="flex-1 overflow-y-auto p-2"
          navItems={navItems}
        />
        <div className="shrink-0 border-border border-t p-2">
          <AppFrameUserMenu auth={auth} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-border border-b px-3">
          <div className="flex items-center gap-2">
            <AppFrameMobileNav
              auth={auth}
              homeHref={homeHref}
              navItems={navItems}
            />
          </div>
          <div className="flex items-center gap-1">
            {themeToggleSlot}
            <DetailPanelTrigger />
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto bg-background">
            {children}
          </main>
          <DetailPanel />
        </div>
      </div>
    </div>
  </DetailPanelProvider>
)
