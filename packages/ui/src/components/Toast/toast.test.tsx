import { Button } from "@repo/ui/components/Button"
import { Toaster, toast } from "@repo/ui/components/Toast"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

const Setup = () => (
  <>
    <Toaster closeButton />
    <Button
      onClick={() => toast.success("Saved", { description: "All set" })}
      type="button"
    >
      Notify
    </Button>
  </>
)

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  })
  // jsdom doesn't implement Pointer Capture, which sonner's swipe-to-dismiss
  // handler calls on pointer down. Stub it so close-button clicks don't throw.
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
})

describe("Toast", () => {
  it("shows a toast when one is triggered", async () => {
    render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Notify" }))
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(screen.getByText("All set")).toBeInTheDocument()
  })

  it("dismisses the toast on close", async () => {
    render(<Setup />)
    await userEvent.click(screen.getByRole("button", { name: "Notify" }))
    await screen.findByText("Saved")
    await userEvent.click(screen.getByRole("button", { name: "Close toast" }))
    await waitForRemoval()
  })
})

const waitForRemoval = async () => {
  await vi.waitFor(() => {
    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
  })
}
