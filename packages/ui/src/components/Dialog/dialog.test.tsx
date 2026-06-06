import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

const Setup = () => (
  <Dialog.Root>
    <Dialog.Trigger render={<Button>Open</Button>} />
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Popup>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description</Dialog.Description>
        <Dialog.Close render={<Button>Close</Button>} />
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
)

describe("Dialog", () => {
  it("opens on trigger click and exposes role dialog", async () => {
    render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("dialog")
    // Base UI renders hidden focus-guard spans with role="button" but no
    // accessible name; they're functionally invisible to assistive tech.
    await expectNoAxeViolations(baseElement, {
      rules: {
        "button-name": { enabled: false },
        "aria-command-name": { enabled: false },
      },
    })
  })
})
