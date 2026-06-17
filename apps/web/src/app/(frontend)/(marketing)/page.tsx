import { env } from "@repo/env/app"
import type { Metadata } from "next"
import type React from "react"
import {
  type Feature,
  FeatureList,
} from "~/features/marketing/components/FeatureList"
import { HeroSection } from "~/features/marketing/components/HeroSection"

const PAGE_TITLE = "Professional License & CEU Renewal Tracker"
const PAGE_DESCRIPTION =
  "Liscet tracks your professional licenses and continuing-education credits across every state and license type, so you always know exactly how many CEUs stand between you and your next renewal."

const KEYWORDS = [
  "professional license tracker",
  "CEU renewal tracker",
  "continuing education credit tracker",
  "license renewal reminders",
] as const satisfies ReadonlyArray<string>

const FEATURES = [
  {
    title: "Every license in one place",
    description:
      "Add licenses from any state and license type, each with its own renewal cycle and CEU requirements.",
  },
  {
    title: "Automatic CEU math",
    description:
      "Log a course once and Liscet credits it against the right category, counting down the hours you still owe.",
  },
  {
    title: "Renewal reminders that land early",
    description:
      "Get notified well before a deadline — never scramble to earn credits the week your license expires.",
  },
] as const satisfies ReadonlyArray<Feature>

export function generateMetadata(): Metadata {
  const url = new URL("/", env.BASE_URL).toString()

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords: [...KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      siteName: "Liscet",
    },
  }
}

export default function HomePage(): React.JSX.Element {
  const url = new URL("/", env.BASE_URL).toString()

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Liscet",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: PAGE_DESCRIPTION,
    url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is serialized from a trusted, static object
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
        type="application/ld+json"
      />
      <HeroSection
        ctaHref="/sign-up"
        ctaLabel="Start tracking free"
        subtitle={PAGE_DESCRIPTION}
        title={PAGE_TITLE}
      />
      <FeatureList features={FEATURES} heading="Built for renewal season" />
    </>
  )
}
