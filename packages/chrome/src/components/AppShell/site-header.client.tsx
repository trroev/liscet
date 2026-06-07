"use client"

import { NavigationMenu } from "@repo/ui/components/NavigationMenu"
import { Separator } from "@repo/ui/components/Separator"
import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { match, P } from "ts-pattern"
import { MobileNav } from "../MobileNav"

export type SiteHeaderProps = {
  authSlot: React.ReactNode
  mobileAuthSlot: React.ReactNode
  className?: string
}

export const SiteHeader = ({
  authSlot,
  mobileAuthSlot,
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
          Mise
        </Link>

        <div className="flex items-center gap-2">
          <NavigationMenu.Root
            aria-label="Site navigation"
            onValueChange={(value) => setNavValue(value)}
            value={navValue}
          >
            <MobileNav authSlot={mobileAuthSlot} isOpen={isMobileNavOpen} />
          </NavigationMenu.Root>

          <div className="hidden md:flex md:gap-2">
            <Separator orientation="vertical" />
            {authSlot}
          </div>
        </div>
      </div>
    </header>
  )
}
