// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import {
  authErrorHandler,
  authSignInSocialHandler,
  server,
} from "@repo/testing/msw"
import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { SocialSignInButton } from "./social-sign-in-button"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?state=x"

const captureSocialSignInBodies = (): Array<Record<string, unknown>> => {
  const bodies: Array<Record<string, unknown>> = []
  server.events.on("request:start", async ({ request }) => {
    if (request.url.endsWith("/api/auth/sign-in/social")) {
      bodies.push((await request.clone().json()) as Record<string, unknown>)
    }
  })
  return bodies
}

afterEach(() => {
  server.events.removeAllListeners()
  cleanup()
})

describe("SocialSignInButton", () => {
  it("starts the Google OAuth flow with the given callback URL and stays pending", async () => {
    server.use(
      authSignInSocialHandler({ url: GOOGLE_AUTH_URL, redirect: true })
    )
    const bodies = captureSocialSignInBodies()
    const user = userEvent.setup()

    renderWithProviders(
      <SocialSignInButton callbackUrl="/dashboard" provider="google" />
    )

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toMatchObject({
      provider: "google",
      callbackURL: "/dashboard",
    })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Redirecting…" })).toBeDisabled()
  })

  it("shows the friendly error and re-enables the button when the provider request fails", async () => {
    server.use(
      authErrorHandler({
        path: "sign-in/social",
        status: 400,
        body: {
          code: "PROVIDER_NOT_FOUND",
          message: "Provider not found",
        },
      })
    )
    const user = userEvent.setup()

    renderWithProviders(
      <SocialSignInButton callbackUrl="/onboarding" provider="google" />
    )

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Provider not found"
    )
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeEnabled()
  })
})
