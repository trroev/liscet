import { RadioGroup } from "@repo/ui/components/RadioGroup"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
] as const

describe("RadioGroup", () => {
  it("renders radios", () => {
    render(<RadioGroup options={OPTIONS} />)
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  it("supports keyboard arrow navigation", async () => {
    render(<RadioGroup defaultValue="a" options={OPTIONS} />)
    const radios = screen.getAllByRole("radio")
    radios[0]?.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(radios[1]).toBeChecked()
  })

  it("has no axe violations", async () => {
    const { container } = render(<RadioGroup options={OPTIONS} />)
    await expectNoAxeViolations(container)
  })
})
