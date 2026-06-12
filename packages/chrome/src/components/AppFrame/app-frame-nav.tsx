"use client"

import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"

export type AppFrameNavItem = Readonly<{
  href: string
  icon?: React.ReactNode
  label: string
}>

export type AppFrameNavProps = {
  navItems: ReadonlyArray<AppFrameNavItem>
  className?: string
  onNavigate?: () => void
}

const findActiveHref = ({
  navItems,
  pathname,
}: {
  navItems: ReadonlyArray<AppFrameNavItem>
  pathname: string
}): string | null =>
  navItems.reduce<string | null>((best, item) => {
    const isMatch =
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    if (!isMatch) {
      return best
    }
    if (best === null || item.href.length > best.length) {
      return item.href
    }
    return best
  }, null)

export const AppFrameNav = ({
  className,
  navItems,
  onNavigate,
}: AppFrameNavProps) => {
  const pathname = usePathname()
  const activeHref = findActiveHref({ navItems, pathname })

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = item.href === activeHref
          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-body-sm",
                  isActive
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary"
                )}
                href={item.href}
                onClick={onNavigate}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
