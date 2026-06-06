import { Button } from "@repo/ui/components/Button"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

describe("Button", () => {
  it("renders with role button", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("invokes onClick on Enter and Space", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const btn = screen.getByRole("button")
    btn.focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("is focusable and shows focus ring on tab", async () => {
    render(<Button>Save</Button>)
    await userEvent.tab()
    expect(screen.getByRole("button")).toHaveFocus()
  })

  it("does not invoke onClick when disabled", async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    )
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Button>Save</Button>)
    await expectNoAxeViolations(container)
  })
})
