"use client"

import { RiErrorWarningLine } from "@remixicon/react"
import { Button } from "@repo/ui/components/Button"

type WidgetErrorFallbackProps = {
  readonly title?: string
  readonly description?: string
  readonly resetErrorBoundary: () => void
}

export const WidgetErrorFallback = ({
  title = "Something went wrong",
  description = "We hit an unexpected error loading this section. Try again in a moment.",
  resetErrorBoundary,
}: WidgetErrorFallbackProps) => (
  <div
    aria-live="polite"
    className="flex flex-col items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4"
    role="alert"
  >
    <div className="flex items-start gap-2">
      <RiErrorWarningLine
        aria-hidden="true"
        className="mt-0.5 text-destructive"
        size={18}
      />
      <div className="space-y-1">
        <p className="font-sans text-body text-text-primary">{title}</p>
        <p className="font-sans text-body-sm text-text-secondary">
          {description}
        </p>
      </div>
    </div>
    <Button onClick={resetErrorBoundary} size="sm" variant="outline">
      Try again
    </Button>
  </div>
)
