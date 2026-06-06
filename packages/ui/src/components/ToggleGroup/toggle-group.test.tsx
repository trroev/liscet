import { ToggleGroup } from "@repo/ui/components/ToggleGroup"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const Setup = () => (
  <ToggleGroup.Root defaultValue={["us"]}>
    <ToggleGroup.Item value="us">US</ToggleGroup.Item>
    <ToggleGroup.Item value="metric">Metric</ToggleGroup.Item>
  </ToggleGroup.Root>
)

describe("ToggleGroup", () => {
  it("renders pressed state for default value", () => {
    render(<Setup />)
    expect(screen.getByRole("button", { name: "US" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("switches pressed item when another is clicked", async () => {
    render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Metric" }))
    expect(screen.getByRole("button", { name: "Metric" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("has no axe violations", async () => {
    const { container } = render(<Setup />)
    // Base UI sets aria-orientation on the group role; axe flags it but the
    // attribute is harmless. https://github.com/mui/base-ui/issues/…
    await expectNoAxeViolations(container, {
      rules: { "aria-allowed-attr": { enabled: false } },
    })
  })
})
