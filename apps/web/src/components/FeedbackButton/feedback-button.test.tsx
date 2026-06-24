// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { capture, success, error } = vi.hoisted(() => ({
  capture: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture }),
}))

vi.mock("@repo/ui/components/Toast", () => ({
  toast: { success, error },
}))

vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    withError: () => ({ error: vi.fn() }),
  }),
}))

import { FeedbackButton } from "./feedback-button"

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Send feedback" }))
  return within(await screen.findByRole("dialog"))
}

describe("FeedbackButton", () => {
  beforeEach(() => {
    capture.mockReset()
    success.mockReset()
    error.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("captures the feedback and shows a success toast", async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackButton />)

    const dialog = await openDialog(user)
    await user.type(dialog.getByLabelText("Feedback"), "great app")
    await user.click(dialog.getByRole("button", { name: "Send" }))

    expect(capture).toHaveBeenCalledWith("feedback submitted", {
      feedback: "great app",
    })
    expect(success).toHaveBeenCalledOnce()
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("shows an error toast and keeps the dialog open when capture fails", async () => {
    capture.mockImplementationOnce(() => {
      throw new Error("network down")
    })
    const user = userEvent.setup()
    renderWithProviders(<FeedbackButton />)

    const dialog = await openDialog(user)
    await user.type(dialog.getByLabelText("Feedback"), "great app")
    await user.click(dialog.getByRole("button", { name: "Send" }))

    expect(error).toHaveBeenCalledOnce()
    expect(success).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(dialog.getByLabelText("Feedback")).toHaveValue("great app")
  })

  it("does not capture an empty message", async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackButton />)

    const dialog = await openDialog(user)
    await user.type(dialog.getByLabelText("Feedback"), "   ")
    await user.click(dialog.getByRole("button", { name: "Send" }))

    expect(capture).not.toHaveBeenCalled()
    expect(success).not.toHaveBeenCalled()
  })
})
