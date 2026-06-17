import type { Metadata } from "next"
import type React from "react"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"

export function generateMetadata(): Metadata {
  return {
    title: "About",
    description:
      "Liscet is a license and continuing-education tracker built to take the guesswork out of staying renewed.",
  }
}

export default function AboutPage(): React.JSX.Element {
  return (
    <MarketingPage title="About Liscet">
      <p>
        Renewing a professional license should be the easy part of your career.
        Liscet keeps every license, renewal date, and continuing-education
        requirement in one place, so you always know exactly where you stand.
      </p>
      <p>
        We built Liscet for practitioners who juggle credentials across states
        and license types — and who would rather spend their time on their work
        than on spreadsheets.
      </p>
    </MarketingPage>
  )
}
