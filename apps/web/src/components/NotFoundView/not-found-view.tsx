import { Button } from "@repo/ui/components/Button"
import Link from "next/link"
import type React from "react"

export const NotFoundView = (): React.JSX.Element => (
  <section className="constrainer flex flex-col items-center justify-center py-24 text-center lg:py-32">
    <p className="font-display text-display text-text-muted/40 leading-none">
      404
    </p>
    <h1 className="mt-4 font-display text-heading-xl text-text-primary">
      Page not found
    </h1>
    <p className="mt-4 max-w-prose text-body-lg text-text-secondary">
      The page you're looking for doesn't exist or may have moved. Your licenses
      and courses are right where you left them.
    </p>
    <Button className="mt-8" nativeButton={false} render={<Link href="/" />}>
      Back to home
    </Button>
  </section>
)
