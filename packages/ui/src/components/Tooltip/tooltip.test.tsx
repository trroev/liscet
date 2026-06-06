import { Button } from "@repo/ui/components/Button"
import { Tooltip, TooltipProvider } from "@repo/ui/components/Tooltip"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const Setup = () => (
  <TooltipProvider>
    <Tooltip content="Tooltip text">
      <Button>Hover</Button>
    </Tooltip>
  </TooltipProvider>
)

describe("Tooltip", () => {
  it("renders the trigger", () => {
    render(<Setup />)
    expect(screen.getByRole("button", { name: "Hover" })).toBeInTheDocument()
  })

  it("shows content on focus", async () => {
    render(<Setup />)
    await userEvent.tab()
    expect(await screen.findByText("Tooltip text")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Setup />)
    await expectNoAxeViolations(container)
  })
})
