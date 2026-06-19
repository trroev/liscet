import type { Metadata } from "next"
import type React from "react"
import { LegalDocument } from "~/features/legal/components/LegalDocument"
import { PRIVACY_POLICY_HTML } from "~/features/legal/content/privacy-policy"
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
      <LegalDocument html={PRIVACY_POLICY_HTML} />
    </MarketingPage>
  )
}
