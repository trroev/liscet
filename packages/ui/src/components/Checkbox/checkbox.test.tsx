import { Checkbox } from "@repo/ui/components/Checkbox"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

describe("Checkbox", () => {
  it("renders with role checkbox", () => {
    render(<Checkbox aria-label="Agree" />)
    expect(screen.getByRole("checkbox", { name: "Agree" })).toBeInTheDocument()
  })

  it("toggles on Space and is keyboard focusable", async () => {
    render(<Checkbox aria-label="Agree" />)
    await userEvent.tab()
    expect(screen.getByRole("checkbox")).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("checkbox")).toBeChecked()
  })

  it("does not toggle when disabled", async () => {
    render(<Checkbox aria-label="Agree" disabled />)
    await userEvent.click(screen.getByRole("checkbox"))
    expect(screen.getByRole("checkbox")).not.toBeChecked()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Checkbox aria-label="Agree" />)
    await expectNoAxeViolations(container)
  })
})
