"use client"

import { captureException } from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          gap: "1rem",
          justifyContent: "center",
          margin: 0,
          minHeight: "100dvh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 500, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#666", margin: 0, maxWidth: "32rem" }}>
          The application hit an unexpected error. Please try again in a moment.
        </p>
        {error.digest ? (
          <p style={{ color: "#999", fontSize: "0.75rem", margin: 0 }}>
            Reference: {error.digest}
          </p>
        ) : null}
        <button
          onClick={reset}
          style={{
            background: "#111",
            border: "none",
            borderRadius: "0.375rem",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.875rem",
            padding: "0.625rem 1.25rem",
          }}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
