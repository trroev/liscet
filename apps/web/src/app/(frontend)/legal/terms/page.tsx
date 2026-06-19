import type { Metadata } from "next"
import type React from "react"
import { LegalDocument } from "~/features/legal/components/LegalDocument"
import { TERMS_OF_SERVICE_HTML } from "~/features/legal/content/terms-of-service"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "Terms of Service",
    description: "The terms governing your use of Liscet.",
  }
}

export default function TermsPage(): React.JSX.Element {
  return (
    <MarketingPage
      description="Liscet helps you track CEUs. You are responsible for verifying
        compliance with your state board."
      title="Terms of Service"
    >
      <LegalDocument html={TERMS_OF_SERVICE_HTML} />
    </MarketingPage>
  )
}
