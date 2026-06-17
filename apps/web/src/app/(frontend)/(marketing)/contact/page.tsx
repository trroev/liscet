import type { Metadata } from "next"
import type React from "react"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

const CONTACT_EMAIL = "hello@liscet.com"

export function generateMetadata(): Metadata {
  return {
    title: "Contact",
    description: `Get in touch with the Liscet team at ${CONTACT_EMAIL}.`,
  }
}

export default function ContactPage(): React.JSX.Element {
  return (
    <MarketingPage title="Contact">
      <p>
        Questions, feedback, or trouble with your account? Email us and we will
        get back to you.
      </p>
      <p>
        <a
          className="font-medium text-accent hover:text-accent-hover"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </MarketingPage>
  )
}
