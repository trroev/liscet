import { Input } from "@repo/ui/components/Input"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

describe("Input", () => {
  it("renders as a textbox", () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument()
  })

  it("accepts keyboard input", async () => {
    render(<Input aria-label="Name" />)
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "Jules")
    expect(input).toHaveValue("Jules")
  })

  it("sets aria-invalid and renders error message when error prop is set", () => {
    render(<Input aria-label="Name" error="Required" id="n" />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("aria-describedby", "n-error")
    expect(screen.getByRole("alert")).toHaveTextContent("Required")
  })

  it("has no axe violations", async () => {
    const { container } = render(<Input aria-label="Name" />)
    await expectNoAxeViolations(container)
  })
})
