"use client"

import { authClient } from "@repo/auth/client"
import type { SocialProvider } from "@repo/auth/social-providers"
import { Button } from "@repo/ui/components/Button"
import { useState } from "react"
import { match } from "ts-pattern"
import { GoogleIcon } from "./google-icon"

const PROVIDER_LABELS = {
  google: "Continue with Google",
} as const satisfies Record<SocialProvider, string>

export type SocialSignInButtonProps = {
  provider: SocialProvider
  /** Same-origin path the user lands on after the OAuth round-trip. */
  callbackUrl: string
}

export const SocialSignInButton = ({
  provider,
  callbackUrl,
}: SocialSignInButtonProps) => {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  /**
   * On success better-auth navigates the browser to the provider, so the
   * pending state is left on to avoid flashing back before the page unloads.
   */
  const handleClick = async (): Promise<void> => {
    setServerError(undefined)
    setIsRedirecting(true)
    const result = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
    })
    match(result)
      .with({ status: "error" }, ({ friendlyMessage }) => {
        setServerError(friendlyMessage)
        setIsRedirecting(false)
      })
      .with({ status: "ok" }, () => undefined)
      .exhaustive()
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-full"
        disabled={isRedirecting}
        onClick={handleClick}
        type="button"
        variant="outline"
      >
        <GoogleIcon className="size-4" />
        {isRedirecting ? "Redirecting…" : PROVIDER_LABELS[provider]}
      </Button>
      {serverError && (
        <p
          aria-live="polite"
          className="font-sans text-body-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}
    </div>
  )
}
