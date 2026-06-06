import { Button } from "@repo/ui/components/Button"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Home",
  description: "A Next.js + Payload + better-auth starter on Turborepo.",
}

export default function HomePage() {
  return (
    <section className="constrainer py-10 lg:py-16">
      <div className="space-y-6">
        <h1 className="font-display text-heading-xl text-text-primary lg:text-heading-2xl">
          next-payload-starter
        </h1>
        <p className="max-w-prose font-sans text-body-lg text-text-secondary">
          A Turborepo monorepo skeleton with Next.js 16, PayloadCMS 3,
          better-auth, MongoDB, Tailwind v4, Vitest, and Biome.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button nativeButton={false} render={<Link href="/posts" />}>
            View posts
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin" />}
            variant="secondary"
          >
            Open admin
          </Button>
        </div>
      </div>
    </section>
  )
}
