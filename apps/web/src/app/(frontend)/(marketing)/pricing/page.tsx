import type { Metadata } from "next"
import type React from "react"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Pricing",
    description:
      "Liscet is completely free while in version 1 — track your licenses and continuing-education credits at no cost.",
  }
}

export default function PricingPage(): React.JSX.Element {
  return (
    <MarketingPage title="Pricing">
      <p className="font-display text-heading-md text-text-primary">
        Liscet is free in v1.
      </p>
      <p>
        Every feature is available at no cost while we are in version 1. Track
        as many licenses and continuing-education credits as you need — there is
        nothing to pay and no card to enter.
      </p>
    </MarketingPage>
  )
}
