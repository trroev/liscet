// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import {
  authErrorHandler,
  authSignInSocialHandler,
  captureAuthRequestBodies,
  server,
} from "@repo/testing/msw"
import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { nav } = vi.hoisted(() => ({
  nav: {
    pathname: "/sign-in",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}))

const { SocialSignInButton } = await import("./social-sign-in-button")

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?state=x"

beforeEach(() => {
  nav.pathname = "/sign-in"
  nav.searchParams = new URLSearchParams()
})

afterEach(() => {
  server.events.removeAllListeners()
  cleanup()
})

describe("SocialSignInButton", () => {
  it("starts the Google OAuth flow with the given callback URL and stays pending", async () => {
    server.use(
      authSignInSocialHandler({ url: GOOGLE_AUTH_URL, redirect: true })
    )
    const bodies = captureAuthRequestBodies({ server, path: "sign-in/social" })
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
      errorCallbackURL: "/sign-in",
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

  it("shows a friendly message for the OAuth error code returned to the page", () => {
    nav.searchParams = new URLSearchParams({ error: "access_denied" })

    renderWithProviders(
      <SocialSignInButton callbackUrl="/onboarding" provider="google" />
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sign-in was cancelled before finishing."
    )
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeEnabled()
  })

  it("falls back to the generic message for an unknown OAuth error code", () => {
    nav.searchParams = new URLSearchParams({ error: "something_else" })

    renderWithProviders(
      <SocialSignInButton callbackUrl="/onboarding" provider="google" />
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again."
    )
  })
})
