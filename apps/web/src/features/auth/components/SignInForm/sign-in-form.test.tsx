// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { buildUser } from "@repo/testing/factories"
import type { SessionPayload } from "@repo/testing/msw"
import {
  authErrorHandler,
  authSignInHandler,
  authSignInSocialHandler,
  server,
} from "@repo/testing/msw"
import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { nav } = vi.hoisted(() => ({
  nav: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/sign-in",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    back: nav.back,
    forward: nav.forward,
    refresh: nav.refresh,
    prefetch: nav.prefetch,
  }),
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

const { SignInForm } = await import("./sign-in-form")

const buildSessionPayload = (): SessionPayload => {
  const user = buildUser()
  return {
    user,
    session: {
      id: "session_0001",
      userId: user.id,
      expiresAt: "2099-01-01T00:00:00.000Z",
    },
  }
}

beforeEach(() => {
  nav.push.mockReset()
  nav.refresh.mockReset()
  nav.searchParams = new URLSearchParams()
})

afterEach(() => {
  server.events.removeAllListeners()
  cleanup()
})

const captureSocialSignInBodies = (): Array<Record<string, unknown>> => {
  const bodies: Array<Record<string, unknown>> = []
  server.events.on("request:start", async ({ request }) => {
    if (request.url.endsWith("/api/auth/sign-in/social")) {
      bodies.push((await request.clone().json()) as Record<string, unknown>)
    }
  })
  return bodies
}

describe("SignInForm", () => {
  it("submits valid credentials and redirects to onboarding by default", async () => {
    server.use(authSignInHandler(buildSessionPayload()))
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/onboarding")
    })
    expect(nav.refresh).toHaveBeenCalled()
  })

  it("redirects to a safe callbackUrl when one is present", async () => {
    nav.searchParams = new URLSearchParams({ callbackUrl: "/dashboard" })
    server.use(authSignInHandler(buildSessionPayload()))
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("shows the friendly message when the server rejects the credentials", async () => {
    server.use(
      authErrorHandler({
        path: "sign-in/email",
        status: 401,
        body: {
          code: "INVALID_EMAIL_OR_PASSWORD",
          message: "Invalid email or password",
        },
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "wrongpass")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(
      await screen.findByText("The email or password you entered is incorrect.")
    ).toBeInTheDocument()
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("shows the inline email error when the email is invalid", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm />)

    const emailField = screen.getByLabelText("Email")
    await user.type(emailField, "not-an-email")
    await user.tab()

    expect(
      await screen.findByText("Enter a valid email address.")
    ).toBeInTheDocument()
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("starts Google sign-in with the safe callbackUrl", async () => {
    nav.searchParams = new URLSearchParams({ callbackUrl: "/dashboard" })
    server.use(
      authSignInSocialHandler({
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        redirect: true,
      })
    )
    const bodies = captureSocialSignInBodies()
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

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
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("falls back to onboarding for Google sign-in when the callbackUrl is off-origin", async () => {
    nav.searchParams = new URLSearchParams({
      callbackUrl: "https://evil.example/phish",
    })
    server.use(
      authSignInSocialHandler({
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        redirect: true,
      })
    )
    const bodies = captureSocialSignInBodies()
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toMatchObject({ callbackURL: "/onboarding" })
  })

  it("shows the error message when Google sign-in cannot start", async () => {
    server.use(
      authErrorHandler({
        path: "sign-in/social",
        status: 400,
        body: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" },
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Provider not found"
    )
    expect(nav.push).not.toHaveBeenCalled()
  })
})
