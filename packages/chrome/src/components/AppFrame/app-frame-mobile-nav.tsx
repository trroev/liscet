"use client"

import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import type { SignedInAuth } from "@repo/types/HeaderAuth"
import { Dialog } from "@repo/ui/components/Dialog"
import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import { useState } from "react"
import { AppFrameNav, type AppFrameNavItem } from "./app-frame-nav"
import { AppFrameUserMenu } from "./app-frame-user-menu"

export type AppFrameMobileNavProps = {
  auth: SignedInAuth
  homeHref: string
  navItems: ReadonlyArray<AppFrameNavItem>
}

const iconButtonClass = cn(
  "inline-flex size-9 items-center justify-center rounded-md text-text-secondary",
  "hover:bg-surface hover:text-text-primary",
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
)

export const AppFrameMobileNav = ({
  auth,
  homeHref,
  navItems,
}: AppFrameMobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog.Root onOpenChange={setIsOpen} open={isOpen}>
      <Dialog.Trigger
        aria-label="Open navigation menu"
        className={cn(iconButtonClass, "md:hidden")}
      >
        <RiMenuLine aria-hidden size={20} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="md:hidden" />
        <Dialog.Popup
          className={cn(
            "fixed top-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col",
            "translate-x-0 translate-y-0 rounded-none border-0 border-border border-r bg-surface p-0 md:hidden",
            "data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
            "data-[ending-style]:opacity-100 data-[starting-style]:opacity-100",
            "data-[ending-style]:scale-100 data-[starting-style]:scale-100",
            "transition-transform duration-200"
          )}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex h-12 shrink-0 items-center justify-between pr-2 pl-4">
            <Link
              className="font-display font-semibold text-body text-text-primary"
              href={homeHref}
              onClick={() => setIsOpen(false)}
            >
              Liscet
            </Link>
            <Dialog.Close
              aria-label="Close navigation menu"
              className={iconButtonClass}
            >
              <RiCloseLine aria-hidden size={20} />
            </Dialog.Close>
          </div>
          <AppFrameNav
            className="flex-1 overflow-y-auto p-2"
            navItems={navItems}
            onNavigate={() => setIsOpen(false)}
          />
          <div className="shrink-0 border-border border-t p-2">
            <AppFrameUserMenu auth={auth} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
