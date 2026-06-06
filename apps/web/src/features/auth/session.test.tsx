// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { User } from "@repo/auth"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const useSessionMock = vi.fn()

vi.mock("@repo/auth/client", () => ({
  authClient: {
    useSession: () => useSessionMock(),
  },
}))

const { SessionProvider, useSession } = await import("@repo/auth/session")

const TestUser = ({ label }: { label: string }) => {
  const { user, isAuthenticated, isLoading } = useSession()
  return (
    <div>
      <span data-testid={`${label}-name`}>{user?.name ?? "no-user"}</span>
      <span data-testid={`${label}-auth`}>{String(isAuthenticated)}</span>
      <span data-testid={`${label}-loading`}>{String(isLoading)}</span>
    </div>
  )
}

const initialUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
} as unknown as User

afterEach(() => {
  cleanup()
  useSessionMock.mockReset()
})

describe("useSession", () => {
  it("keeps initialUser visible while authClient.useSession is in flight", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: true })

    render(
      <SessionProvider initialUser={initialUser}>
        <TestUser label="pending" />
      </SessionProvider>
    )

    expect(screen.getByTestId("pending-name")).toHaveTextContent("Alice")
    expect(screen.getByTestId("pending-auth")).toHaveTextContent("true")
    expect(screen.getByTestId("pending-loading")).toHaveTextContent("false")
  })

  it("keeps initialUser visible when client transiently returns null during refetch", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: true })

    render(
      <SessionProvider initialUser={initialUser}>
        <TestUser label="refetch" />
      </SessionProvider>
    )

    expect(screen.getByTestId("refetch-name")).toHaveTextContent("Alice")
    expect(screen.getByTestId("refetch-auth")).toHaveTextContent("true")
  })

  it("reflects the client user once the query resolves with a populated value", () => {
    const clientUser = { ...initialUser, name: "Alice (fresh)" }
    useSessionMock.mockReturnValue({
      data: { user: clientUser },
      isPending: false,
    })

    render(
      <SessionProvider initialUser={initialUser}>
        <TestUser label="resolved" />
      </SessionProvider>
    )

    expect(screen.getByTestId("resolved-name")).toHaveTextContent(
      "Alice (fresh)"
    )
    expect(screen.getByTestId("resolved-auth")).toHaveTextContent("true")
  })

  it("reflects signed-out once the client resolves with null", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: false })

    render(
      <SessionProvider initialUser={initialUser}>
        <TestUser label="signed-out" />
      </SessionProvider>
    )

    expect(screen.getByTestId("signed-out-name")).toHaveTextContent("no-user")
    expect(screen.getByTestId("signed-out-auth")).toHaveTextContent("false")
  })

  it("reports isLoading when no initialUser and client is pending", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: true })

    render(
      <SessionProvider initialUser={null}>
        <TestUser label="cold" />
      </SessionProvider>
    )

    expect(screen.getByTestId("cold-loading")).toHaveTextContent("true")
    expect(screen.getByTestId("cold-auth")).toHaveTextContent("false")
  })
})
