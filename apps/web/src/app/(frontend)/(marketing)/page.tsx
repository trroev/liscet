import { Button } from "@repo/ui/components/Button"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Home",
  description: "Liscet.",
}

export default function HomePage() {
  return (
    <section className="constrainer py-10 lg:py-16">
      <div className="space-y-6">
        <h1 className="font-display text-heading-xl text-text-primary lg:text-heading-2xl">
          Liscet
        </h1>
        <div className="flex flex-wrap gap-4">
          <Button nativeButton={false} render={<Link href="/admin" />}>
            Open admin
          </Button>
        </div>
      </div>
    </section>
  )
}
