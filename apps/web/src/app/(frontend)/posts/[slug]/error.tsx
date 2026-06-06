"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteErrorFallback error={error} reset={reset} />
}
