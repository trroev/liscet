import { NavigationMenu } from "@repo/ui/components/NavigationMenu"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

const Setup = () => (
  <NavigationMenu.Root>
    <NavigationMenu.List>
      <NavigationMenu.Item>
        <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu.Root>
)

describe("NavigationMenu", () => {
  it("renders a navigation landmark and link", () => {
    render(<Setup />)
    expect(screen.getByRole("navigation")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    )
  })

  it("has no axe violations", async () => {
    const { container } = render(<Setup />)
    await expectNoAxeViolations(container)
  })
})
