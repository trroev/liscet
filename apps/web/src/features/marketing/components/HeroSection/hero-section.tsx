import { Button } from "@repo/ui/components/Button"
import Link from "next/link"
import type React from "react"

export type HeroSectionProps = {
  title: string
  subtitle: string
  ctaHref: string
  ctaLabel: string
}

export const HeroSection = ({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: HeroSectionProps): React.JSX.Element => (
  <section className="constrainer py-16 lg:py-24">
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-heading-xl text-text-primary lg:text-heading-2xl">
        {title}
      </h1>
      <p className="text-body-lg text-text-secondary">{subtitle}</p>
      <div className="flex flex-wrap gap-4">
        <Button nativeButton={false} render={<Link href={ctaHref} />}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  </section>
)
