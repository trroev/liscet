import { RichText } from "@repo/payload/components/RichText"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type React from "react"
import { MarketingPage } from "~/features/marketing/components/MarketingPage"
import { getPublishedPage } from "~/lib/queries/pages"

const SLUG = "about"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage({ slug: SLUG })
  if (page === undefined) {
    return {}
  }
  return {
    title: page.meta?.title ?? page.title,
    description: page.meta?.description ?? undefined,
  }
}

export default async function AboutPage(): Promise<React.JSX.Element> {
  const page = await getPublishedPage({ slug: SLUG })
  if (page === undefined) {
    notFound()
  }
  return (
    <MarketingPage title={page.title}>
      <RichText data={page.body} />
    </MarketingPage>
  )
}
