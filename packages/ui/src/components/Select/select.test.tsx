import { Select } from "@repo/ui/components/Select"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const OPTIONS = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
]

describe("Select", () => {
  it("renders a combobox trigger", () => {
    render(<Select options={OPTIONS} />)
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("opens the popup on click", async () => {
    render(<Select options={OPTIONS} />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(
      await screen.findByRole("option", { name: "Apple" })
    ).toBeInTheDocument()
  })

  it("sets aria-invalid when error is provided", () => {
    render(<Select error="Required" id="s" options={OPTIONS} />)
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Required")
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <label htmlFor="s-axe">Fruit</label>
        <Select id="s-axe" options={OPTIONS} />
      </>
    )
    await expectNoAxeViolations(container)
  })
})
