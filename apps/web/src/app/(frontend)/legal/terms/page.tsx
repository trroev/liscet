import { env } from "@repo/env/app"
import type { Metadata } from "next"
import type React from "react"
import { TermlyEmbed } from "~/features/legal/components/TermlyEmbed"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Terms of Service",
    description: "The terms governing your use of Liscet.",
  }
}

export default function TermsPage(): React.JSX.Element {
  return (
    <MarketingPage title="Terms of Service">
      <p>
        Liscet helps you track CEUs. You are responsible for verifying
        compliance with your state board.
      </p>
      <TermlyEmbed dataId={env.NEXT_PUBLIC_TERMLY_TERMS_ID} />
    </MarketingPage>
  )
}
