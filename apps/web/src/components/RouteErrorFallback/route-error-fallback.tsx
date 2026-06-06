"use client"

import { Button } from "@repo/ui/components/Button"
import { captureException } from "@sentry/nextjs"
import { useEffect } from "react"

type RouteErrorFallbackProps = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
  readonly title?: string
  readonly description?: string
}

export const RouteErrorFallback = ({
  error,
  reset,
  title = "Something went wrong",
  description = "We hit an unexpected error while loading this page. Please try again in a moment.",
}: RouteErrorFallbackProps) => {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <section className="constrainer flex flex-col items-start space-y-4 py-16">
      <h1 className="font-display text-heading-xl text-text-primary">
        {title}
      </h1>
      <p className="max-w-prose font-sans text-body text-text-muted">
        {description}
      </p>
      {error.digest ? (
        <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
          Reference: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset}>Try again</Button>
    </section>
  )
}
