import { env } from "@repo/env/app"
import type { Metadata } from "next"
import { getPayload } from "payload"
import type React from "react"
import type { SoftwareApplication, WithContext } from "schema-dts"
import {
  type Feature,
  FeatureList,
} from "~/features/marketing/components/FeatureList"
import { HeroSection } from "~/features/marketing/components/HeroSection"
import { StructuredData } from "~/features/marketing/components/StructuredData"
import config from "~/payload.config"

const getHomepage = async () => {
  const payload = await getPayload({ config })

  return payload.findGlobal({ slug: "homepage" })
}

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage()
  const url = new URL("/", env.BASE_URL).toString()

  return {
    title: homepage.meta?.title ?? homepage.hero.title,
    description: homepage.meta?.description ?? homepage.hero.subtitle,
    keywords: homepage.meta?.keywords ?? undefined,
    alternates: { canonical: url },
  }
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const homepage = await getHomepage()
  const url = new URL("/", env.BASE_URL).toString()

  const description = homepage.meta?.description ?? homepage.hero.subtitle

  const features = (homepage.features ?? []).map(
    (feature): Feature => ({
      title: feature.title,
      description: feature.description,
    })
  )

  const softwareApplicationJsonLd: WithContext<SoftwareApplication> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Liscet",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <>
      <StructuredData<SoftwareApplication> item={softwareApplicationJsonLd} />
      <HeroSection
        ctaHref={homepage.hero.ctaHref}
        ctaLabel={homepage.hero.ctaLabel}
        subtitle={homepage.hero.subtitle}
        title={homepage.hero.title}
      />
      <FeatureList features={features} heading={homepage.featuresHeading} />
    </>
  )
}
