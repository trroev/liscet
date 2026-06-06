"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorFallback
      description="We couldn't load your profile. Please try again in a moment."
      error={error}
      reset={reset}
      title="Profile unavailable"
    />
  )
}
