import { cn } from "@repo/ui/utils/cn"
import Link from "next/link"
import type React from "react"

export type CardProps = {
  href: string
  media?: React.ReactNode
  badges?: React.ReactNode
  lockUp: {
    title: string
    body?: string
  }
  className?: string
  titleAs?: "h2" | "h3"
}

export const Card = ({
  href,
  media,
  badges,
  lockUp,
  className,
  titleAs: Title = "h3",
}: CardProps) => (
  <Link
    className={cn(
      "group flex flex-col space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className
    )}
    href={href}
  >
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-surface">
      {media}
    </div>
    {badges && (
      <div className="flex flex-wrap items-center gap-2">{badges}</div>
    )}
    <div className="flex flex-col space-y-1">
      <Title className="font-display text-heading-md text-text-primary">
        {lockUp.title}
      </Title>
      {lockUp.body && (
        <p className="font-sans text-body-sm text-text-secondary">
          {lockUp.body}
        </p>
      )}
    </div>
  </Link>
)
