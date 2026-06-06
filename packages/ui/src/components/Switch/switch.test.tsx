import { Switch } from "@repo/ui/components/Switch"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

describe("Switch", () => {
  it("renders with role switch", () => {
    render(<Switch aria-label="Metric units" />)
    expect(
      screen.getByRole("switch", { name: "Metric units" })
    ).toBeInTheDocument()
  })

  it("toggles on Space when focused", async () => {
    render(<Switch aria-label="Toggle" />)
    await userEvent.tab()
    expect(screen.getByRole("switch")).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("switch")).toBeChecked()
  })

  it("does not toggle when disabled", async () => {
    render(<Switch aria-label="Toggle" disabled />)
    await userEvent.click(screen.getByRole("switch"))
    expect(screen.getByRole("switch")).not.toBeChecked()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Switch aria-label="Toggle" />)
    await expectNoAxeViolations(container)
  })
})
