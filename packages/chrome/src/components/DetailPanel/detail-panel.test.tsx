// @vitest-environment jsdom
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { DetailPanel } from "./detail-panel"
import { DetailPanelContent } from "./detail-panel-content"
import { DetailPanelProvider } from "./detail-panel-context"
import { DetailPanelTrigger } from "./detail-panel-trigger"

const renderPanel = (children?: React.ReactNode) =>
  render(
    <DetailPanelProvider>
      <DetailPanelTrigger />
      {children}
      <DetailPanel />
    </DetailPanelProvider>
  )

describe("DetailPanel", () => {
  it("should be hidden until the trigger is clicked", async () => {
    const user = userEvent.setup()
    renderPanel()

    const region = screen.getByLabelText("Details", { selector: "aside" })
    expect(region).toHaveAttribute("aria-hidden", "true")

    await user.click(screen.getByRole("button", { name: "Open detail panel" }))

    expect(region).toHaveAttribute("aria-hidden", "false")
    expect(screen.getByText("Nothing to show here yet.")).toBeInTheDocument()
  })

  it("should toggle with Cmd+I and close with Escape", async () => {
    const user = userEvent.setup()
    renderPanel()

    const region = screen.getByLabelText("Details", { selector: "aside" })

    await user.keyboard("{Meta>}i{/Meta}")
    expect(region).toHaveAttribute("aria-hidden", "false")

    await user.keyboard("{Meta>}i{/Meta}")
    expect(region).toHaveAttribute("aria-hidden", "true")

    await user.keyboard("{Meta>}i{/Meta}")
    await user.keyboard("{Escape}")
    expect(region).toHaveAttribute("aria-hidden", "true")
  })

  it("should render content registered via DetailPanelContent", async () => {
    const user = userEvent.setup()
    renderPanel(
      <DetailPanelContent>
        <p>License detail</p>
      </DetailPanelContent>
    )

    await user.click(screen.getByRole("button", { name: "Open detail panel" }))

    expect(screen.getByText("License detail")).toBeInTheDocument()
    expect(
      screen.queryByText("Nothing to show here yet.")
    ).not.toBeInTheDocument()
  })

  it("should clear registered content when the screen unmounts", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DetailPanelProvider>
        <DetailPanelTrigger />
        <DetailPanelContent>
          <p>License detail</p>
        </DetailPanelContent>
        <DetailPanel />
      </DetailPanelProvider>
    )

    await user.click(screen.getByRole("button", { name: "Open detail panel" }))
    expect(screen.getByText("License detail")).toBeInTheDocument()

    rerender(
      <DetailPanelProvider>
        <DetailPanelTrigger />
        <DetailPanel />
      </DetailPanelProvider>
    )

    expect(screen.queryByText("License detail")).not.toBeInTheDocument()
    expect(screen.getByText("Nothing to show here yet.")).toBeInTheDocument()
  })

  it("has no axe violations when open", async () => {
    const user = userEvent.setup()
    const { container } = renderPanel(
      <DetailPanelContent>
        <p>License detail</p>
      </DetailPanelContent>
    )

    await user.click(screen.getByRole("button", { name: "Open detail panel" }))

    await expectNoAxeViolations(container)
  })
})
