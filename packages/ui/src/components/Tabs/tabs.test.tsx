import { Tabs } from "@repo/ui/components/Tabs"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const Setup = () => (
  <Tabs.Root defaultValue="one">
    <Tabs.List>
      <Tabs.Tab value="one">One</Tabs.Tab>
      <Tabs.Tab value="two">Two</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="one">Panel one</Tabs.Panel>
    <Tabs.Panel value="two">Panel two</Tabs.Panel>
  </Tabs.Root>
)

describe("Tabs", () => {
  it("renders tablist and tabs", () => {
    render(<Setup />)
    expect(screen.getByRole("tablist")).toBeInTheDocument()
    expect(screen.getAllByRole("tab")).toHaveLength(2)
  })

  it("switches with arrow keys", async () => {
    render(<Setup />)
    const tabs = screen.getAllByRole("tab")
    tabs[0]?.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Setup />)
    await expectNoAxeViolations(container)
  })
})
