import type React from "react"

export type FormErrorProps = {
  message: string | undefined
}

/**
 * The shared server-error rendering for any form in the app: a polite
 * live-region alert that appears when there is a message and renders nothing
 * when there is not.
 */
export const FormError = ({
  message,
}: FormErrorProps): React.JSX.Element | null =>
  message ? (
    <p
      aria-live="polite"
      className="font-sans text-body-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  ) : null
