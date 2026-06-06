import "@testing-library/jest-dom/vitest"

import { useSession } from "@repo/auth/session"
import { describe, expect, it, vi } from "vitest"

vi.mock("@repo/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
  },
}))

import { buildPost, buildUser, resetFactoryCounter } from "./factories"
import {
  authGetSessionHandler,
  authSignOutHandler,
  payloadListHandler,
  server,
} from "./msw"
import { renderWithProviders } from "./render"

const SessionConsumer = () => {
  const { user, isAuthenticated } = useSession()
  return (
    <div>
      <span data-testid="name">{user?.name ?? "no-user"}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
    </div>
  )
}

describe("@repo/testing", () => {
  it("factories produce deterministic objects with overrides", () => {
    resetFactoryCounter()
    const user = buildUser({ name: "Alice" })
    const post = buildPost({ title: "Hello, world" })

    expect(user.name).toBe("Alice")
    expect(user.email.endsWith("@example.com")).toBe(true)
    expect(post.title).toBe("Hello, world")
    expect(post.sections).toHaveLength(1)
  })

  it("renderWithProviders mounts children inside SessionProvider", () => {
    const user = buildUser({ name: "Renderer" })
    const { getByTestId } = renderWithProviders(<SessionConsumer />, {
      initialUser: user,
    })
    expect(getByTestId("name")).toHaveTextContent("Renderer")
    expect(getByTestId("auth")).toHaveTextContent("true")
  })

  it("msw server is configured and handler factories are importable", () => {
    expect(typeof server.listen).toBe("function")
    expect(authGetSessionHandler(null)).toBeDefined()
    expect(authSignOutHandler()).toBeDefined()
    expect(payloadListHandler("posts", [buildPost()])).toBeDefined()
  })
})
