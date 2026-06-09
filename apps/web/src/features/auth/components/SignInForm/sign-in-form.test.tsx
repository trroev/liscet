// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { buildUser } from "@repo/testing/factories"
import type { SessionPayload } from "@repo/testing/msw"
import { authErrorHandler, authSignInHandler, server } from "@repo/testing/msw"
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
})

afterEach(() => {
  cleanup()
})

describe("SignInForm", () => {
  it("submits valid credentials and redirects to the default callback", async () => {
    server.use(authSignInHandler(buildSessionPayload()))
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/")
    })
    expect(nav.refresh).toHaveBeenCalled()
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
})
