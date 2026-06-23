import type { Metadata } from "next"
import type React from "react"
import { Disclaimer } from "~/features/legal/components/Disclaimer"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Disclaimer",
    description:
      "Liscet helps you track CEUs but is not a substitute for verifying compliance with your state board.",
  }
}

export default function DisclaimerPage(): React.JSX.Element {
  return (
    <MarketingPage title="Disclaimer">
      <Disclaimer />
    </MarketingPage>
  )
}
