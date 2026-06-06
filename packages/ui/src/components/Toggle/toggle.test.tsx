import { Toggle } from "@repo/ui/components/Toggle"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

describe("Toggle", () => {
  it("renders with role button and aria-pressed", () => {
    render(<Toggle>Bold</Toggle>)
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("toggles aria-pressed on Space", async () => {
    render(<Toggle>Bold</Toggle>)
    await userEvent.tab()
    expect(screen.getByRole("button")).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })

  it("has no axe violations", async () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    await expectNoAxeViolations(container)
  })
})
