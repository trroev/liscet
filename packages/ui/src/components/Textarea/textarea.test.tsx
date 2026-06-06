import { Textarea } from "@repo/ui/components/Textarea"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

describe("Textarea", () => {
  it("renders as a textbox", () => {
    render(<Textarea aria-label="Notes" />)
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument()
  })

  it("accepts keyboard input", async () => {
    render(<Textarea aria-label="Notes" />)
    await userEvent.type(screen.getByRole("textbox"), "Hello")
    expect(screen.getByRole("textbox")).toHaveValue("Hello")
  })

  it("sets aria-invalid and renders error", () => {
    render(<Textarea aria-label="Notes" error="Required" id="n" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Required")
  })

  it("has no axe violations", async () => {
    const { container } = render(<Textarea aria-label="Notes" />)
    await expectNoAxeViolations(container)
  })
})
