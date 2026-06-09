// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { buildUser } from "@repo/testing/factories"
import type { SessionPayload } from "@repo/testing/msw"
import { authErrorHandler, authSignUpHandler, server } from "@repo/testing/msw"
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
  cleanup()
})

describe("SignUpForm", () => {
  it("creates an account and redirects to the default callback", async () => {
    server.use(authSignUpHandler(buildSessionPayload()))
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/")
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
})
