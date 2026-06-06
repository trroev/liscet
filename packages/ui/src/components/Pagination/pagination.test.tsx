import { Pagination } from "@repo/ui/components/Pagination"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

describe("Pagination", () => {
  it("marks the current page with aria-current", () => {
    render(
      <Pagination currentPage={3} onPageChange={vi.fn()} totalPages={10} />
    )
    expect(
      screen.getByRole("button", { name: "Go to page 3" })
    ).toHaveAttribute("aria-current", "page")
  })

  it("invokes onPageChange when next is clicked", async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={1} onPageChange={onPageChange} totalPages={10} />
    )
    await userEvent.click(
      screen.getByRole("button", { name: "Go to next page" })
    )
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("disables previous on first page", () => {
    render(
      <Pagination currentPage={1} onPageChange={vi.fn()} totalPages={10} />
    )
    expect(
      screen.getByRole("button", { name: "Go to previous page" })
    ).toBeDisabled()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <Pagination currentPage={1} onPageChange={vi.fn()} totalPages={5} />
    )
    await expectNoAxeViolations(container)
  })
})
