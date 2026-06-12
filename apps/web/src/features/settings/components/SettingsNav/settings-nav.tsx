"use client"

import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { SETTINGS_SECTIONS } from "../../lib/sections"

export type SettingsNavProps = {
  userSlug: string
}

export const SettingsNav = ({ userSlug }: SettingsNavProps) => {
  const activeSegment = useSelectedLayoutSegment()

  return (
    <nav aria-label="Settings">
      <ul className="flex flex-col gap-0.5">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = section.segment === activeSegment
          return (
            <li key={section.segment}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-md px-2 py-1.5 text-body-sm",
                  isActive
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary"
                )}
                href={`/${userSlug}/settings/${section.segment}`}
              >
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
