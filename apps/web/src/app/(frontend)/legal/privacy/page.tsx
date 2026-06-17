import { env } from "@repo/env/app"
import type { Metadata } from "next"
import type React from "react"
import { TermlyEmbed } from "~/features/legal/components/TermlyEmbed"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Privacy Policy",
    description: "How Liscet collects, uses, and protects your data.",
  }
}

export default function PrivacyPage(): React.JSX.Element {
  return (
    <MarketingPage title="Privacy Policy">
      <TermlyEmbed dataId={env.NEXT_PUBLIC_TERMLY_PRIVACY_ID} />
    </MarketingPage>
  )
}
