// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@repo/testing/render"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { cancelAccountDeletion, nav } = vi.hoisted(() => ({
  cancelAccountDeletion: vi.fn(),
  nav: { refresh: vi.fn() },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: nav.refresh }),
}))

vi.mock("../../actions/cancel-account-deletion", () => ({
  cancelAccountDeletion,
}))

import { DeletionBanner } from "./deletion-banner"

const SCHEDULED_DATE_TEXT = /scheduled for permanent deletion on July 1, 2026/

describe("DeletionBanner", () => {
  beforeEach(() => {
    cancelAccountDeletion.mockReset()
    nav.refresh.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("should show the hard-delete date 30 days after the deletion request", () => {
    render(<DeletionBanner deletedAt={new Date("2026-06-01T12:00:00Z")} />)

    expect(screen.getByText(SCHEDULED_DATE_TEXT)).toBeInTheDocument()
  })

  it("should cancel the deletion and refresh the route", async () => {
    cancelAccountDeletion.mockResolvedValueOnce({
      status: "success",
      data: undefined,
    })
    const user = userEvent.setup()
    render(<DeletionBanner deletedAt={new Date("2026-06-01T12:00:00Z")} />)

    await user.click(screen.getByRole("button", { name: "Cancel deletion" }))

    await waitFor(() => {
      expect(cancelAccountDeletion).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(nav.refresh).toHaveBeenCalled()
    })
  })

  it("should surface a server error without refreshing", async () => {
    cancelAccountDeletion.mockResolvedValueOnce({
      status: "error",
      message: "You must be signed in.",
    })
    const user = userEvent.setup()
    render(<DeletionBanner deletedAt={new Date("2026-06-01T12:00:00Z")} />)

    await user.click(screen.getByRole("button", { name: "Cancel deletion" }))

    expect(
      await screen.findByText("You must be signed in.")
    ).toBeInTheDocument()
    expect(nav.refresh).not.toHaveBeenCalled()
  })
})
