// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { LogCourseResult } from "../../lib/types"
import { LogCourseFormView } from "./log-course-form.view"

afterEach(() => {
  cleanup()
})

const ok = (): Promise<LogCourseResult> =>
  Promise.resolve({ status: "success", data: { courseId: "course-1" } })

const fillValidForm = async (
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await user.type(screen.getByLabelText("Course title"), "Ethics 101")
  fireEvent.change(screen.getByLabelText("Completion date"), {
    target: { value: "2024-01-15" },
  })
  fireEvent.change(screen.getByLabelText("Credit hours"), {
    target: { value: "2" },
  })
  const formatTrigger = screen.getByLabelText("Format")
  formatTrigger.focus()
  await user.keyboard("{Enter}")
  await user.click(screen.getByRole("option", { name: "Live" }))
}

describe("LogCourseFormView", () => {
  it("shows inline validation errors and does not submit when empty", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(ok)
    renderWithProviders(
      <LogCourseFormView onSubmit={onSubmit} onSuccess={vi.fn()} />
    )

    await user.click(screen.getByRole("button", { name: "Log course" }))

    expect(
      await screen.findByText("Enter the course title.")
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits parsed values and calls onSuccess", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(ok)
    const onSuccess = vi.fn()
    renderWithProviders(
      <LogCourseFormView onSubmit={onSubmit} onSuccess={onSuccess} />
    )

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Log course" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        completedAt: "2024-01-15",
        format: "live",
        hours: 2,
        title: "Ethics 101",
      })
    )
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
  })

  it("renders a server error when submission fails", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(
      (): Promise<LogCourseResult> =>
        Promise.resolve({ status: "error", message: "Something went wrong." })
    )
    renderWithProviders(
      <LogCourseFormView onSubmit={onSubmit} onSuccess={vi.fn()} />
    )

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: "Log course" }))

    expect(await screen.findByText("Something went wrong.")).toBeInTheDocument()
  })
})
