// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { buildUser } from "@repo/testing/factories"
import type { SessionPayload } from "@repo/testing/msw"
import {
  authErrorHandler,
  authSignInSocialHandler,
  authSignUpHandler,
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
    pathname: "/sign-up",
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

const { SignUpForm } = await import("./sign-up-form")

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

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Name"), "Chef Example")
  await user.type(screen.getByLabelText("Email"), "chef@example.com")
  await user.type(screen.getByLabelText("Password"), "hunter22")
  await user.type(screen.getByLabelText("Confirm password"), "hunter22")
}

beforeEach(() => {
  nav.push.mockReset()
  nav.refresh.mockReset()
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

describe("SignUpForm", () => {
  it("creates an account and redirects to onboarding", async () => {
    server.use(authSignUpHandler(buildSessionPayload()))
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/onboarding")
    })
    expect(nav.refresh).toHaveBeenCalled()
  })

  it("shows the friendly message when the email is already registered", async () => {
    server.use(
      authErrorHandler({
        path: "sign-up/email",
        status: 422,
        body: {
          code: "USER_ALREADY_EXISTS",
          message: "User already exists",
        },
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(
      await screen.findByText("An account with that email already exists.")
    ).toBeInTheDocument()
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("starts Google sign-up with onboarding as the callback", async () => {
    server.use(
      authSignInSocialHandler({
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        redirect: true,
      })
    )
    const bodies = captureSocialSignInBodies()
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toMatchObject({
      provider: "google",
      callbackURL: "/onboarding",
    })
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("shows the error message when Google sign-up cannot start", async () => {
    server.use(
      authErrorHandler({
        path: "sign-in/social",
        status: 400,
        body: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" },
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Provider not found"
    )
    expect(nav.push).not.toHaveBeenCalled()
  })
})
