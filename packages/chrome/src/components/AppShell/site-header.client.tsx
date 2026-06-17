"use client"

import { NavigationMenu } from "@repo/ui/components/NavigationMenu"
import { Separator } from "@repo/ui/components/Separator"
import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { match, P } from "ts-pattern"
import { MobileNav } from "../MobileNav"

export type MarketingNavLink = {
  href: string
  label: string
}

export type SiteHeaderProps = {
  authSlot: React.ReactNode
  mobileAuthSlot: React.ReactNode
  themeToggleSlot?: React.ReactNode
  navLinks?: ReadonlyArray<MarketingNavLink>
  className?: string
}

export const SiteHeader = ({
  authSlot,
  mobileAuthSlot,
  themeToggleSlot,
  navLinks = [],
  className,
}: SiteHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [navValue, setNavValue] = useState<string | null>(null)
  const isMobileNavOpen = navValue === "mobile"

  useEffect(() => {
    let rafId: number | null = null
    const handleScroll = () => {
      match(rafId)
        .with(null, () => {
          rafId = window.requestAnimationFrame(() => {
            setIsScrolled(window.scrollY > 0)
            rafId = null
          })
        })
        .with(P.number, () => {
          // already scheduled this frame — drop the event
        })
        .exhaustive()
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      match(rafId)
        .with(P.number, (id) => window.cancelAnimationFrame(id))
        .with(null, () => {
          // nothing pending
        })
        .exhaustive()
    }
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-200",
        isScrolled || navValue
          ? "border-border/40 border-b bg-background/80 backdrop-blur-md"
          : "border-transparent border-b",
        className
      )}
    >
      <div className="constrainer flex h-16 items-center justify-between">
        <Link
          className="font-display text-heading-md text-text-primary"
          href="/"
        >
          Liscet
        </Link>

        <div className="flex items-center gap-6">
          <NavigationMenu.Root
            aria-label="Site navigation"
            onValueChange={(value) => setNavValue(value)}
            value={navValue}
          >
            <NavigationMenu.List className="hidden gap-6 md:flex">
              {navLinks.map((link) => (
                <NavigationMenu.Item key={link.href}>
                  <NavigationMenu.Link
                    className="text-body text-text-secondary hover:text-text-primary"
                    render={<Link href={link.href} />}
                  >
                    {link.label}
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>

            <MobileNav
              authSlot={mobileAuthSlot}
              isOpen={isMobileNavOpen}
              navLinks={navLinks}
            />
          </NavigationMenu.Root>

          <div className="hidden md:flex md:items-center md:gap-2">
            <Separator orientation="vertical" />
            {themeToggleSlot}
            {authSlot}
          </div>
        </div>
      </div>
    </header>
  )
}
