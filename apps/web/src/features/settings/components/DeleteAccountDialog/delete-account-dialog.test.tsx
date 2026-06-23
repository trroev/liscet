// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { deleteAccount, nav } = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  nav: { refresh: vi.fn() },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: nav.refresh }),
}))

vi.mock("../../actions/delete-account", () => ({
  deleteAccount,
}))

import { DeleteAccountDialog } from "./delete-account-dialog"

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Delete account" }))
  return within(await screen.findByRole("dialog"))
}

describe("DeleteAccountDialog", () => {
  beforeEach(() => {
    deleteAccount.mockReset()
    nav.refresh.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("should block submission when the password is empty", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteAccountDialog />)

    const dialog = await openDialog(user)
    await user.click(dialog.getByRole("button", { name: "Delete account" }))

    expect(await dialog.findByText("Password is required.")).toBeInTheDocument()
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it("should surface a server error when the password is wrong", async () => {
    deleteAccount.mockResolvedValueOnce({
      status: "error",
      message: "Incorrect password.",
    })
    const user = userEvent.setup()
    renderWithProviders(<DeleteAccountDialog />)

    const dialog = await openDialog(user)
    await user.type(dialog.getByLabelText("Password"), "wrong")
    await user.click(dialog.getByRole("button", { name: "Delete account" }))

    expect(await dialog.findByRole("alert")).toHaveTextContent(
      "Incorrect password."
    )
    expect(nav.refresh).not.toHaveBeenCalled()
  })

  it("should close the dialog and refresh the route on success", async () => {
    deleteAccount.mockResolvedValueOnce({
      status: "success",
      data: { deletedAt: "2026-06-12T00:00:00.000Z" },
    })
    const user = userEvent.setup()
    renderWithProviders(<DeleteAccountDialog />)

    const dialog = await openDialog(user)
    await user.type(dialog.getByLabelText("Password"), "hunter22")
    await user.click(dialog.getByRole("button", { name: "Delete account" }))

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalledWith({ password: "hunter22" })
    })
    await waitFor(() => {
      expect(nav.refresh).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })
})
