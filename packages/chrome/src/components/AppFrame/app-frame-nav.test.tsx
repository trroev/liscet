// @vitest-environment jsdom
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppFrameNav, type AppFrameNavItem } from "./app-frame-nav"

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn<() => string>(() => "/"),
}))

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}))

const NAV_ITEMS = [
  { href: "/jane", label: "Dashboard" },
  { href: "/jane/licenses", label: "Licenses" },
  { href: "/jane/courses", label: "Courses" },
  { href: "/jane/settings", label: "Settings" },
] as const satisfies ReadonlyArray<AppFrameNavItem>

describe("AppFrameNav", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/")
  })

  it("should render every nav item as a link", () => {
    render(<AppFrameNav navItems={NAV_ITEMS} />)

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href
      )
    }
  })

  it("should mark the dashboard item current on the root slug path", () => {
    usePathnameMock.mockReturnValue("/jane")
    render(<AppFrameNav navItems={NAV_ITEMS} />)

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Licenses" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("should prefer the longest matching href over the dashboard prefix", () => {
    usePathnameMock.mockReturnValue("/jane/licenses/123")
    render(<AppFrameNav navItems={NAV_ITEMS} />)

    expect(screen.getByRole("link", { name: "Licenses" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("has no axe violations", async () => {
    usePathnameMock.mockReturnValue("/jane")
    const { container } = render(<AppFrameNav navItems={NAV_ITEMS} />)

    await expectNoAxeViolations(container)
  })
})
