// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@repo/testing/render"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DASHBOARD_QUERY_KEY, LICENSES_QUERY_KEY } from "~/lib/query-keys"
import type { LicenseView } from "../../lib/types"

const { updateLicense } = vi.hoisted(() => ({ updateLicense: vi.fn() }))

vi.mock("../../actions/update-license", () => ({ updateLicense }))

import { EditLicenseDialog } from "./edit-license-dialog"

const license: LicenseView = {
  expiresAt: "2027-03-01T00:00:00.000Z",
  id: "license-1",
  issuedAt: "2025-03-01T00:00:00.000Z",
  licenseNumber: "ABC-123",
  licenseType: "LCSW",
  renewalCycleMonths: 24,
  state: "CA",
  status: "active",
}

let queryClient: QueryClient

const renderDialog = (): void => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({
    children,
  }: {
    children: ReactNode
  }): React.JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  render(<EditLicenseDialog license={license} />, { wrapper })
}

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Edit" }))
  return within(await screen.findByRole("dialog"))
}

beforeEach(() => {
  updateLicense.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("EditLicenseDialog", () => {
  it("pre-fills the expiration date from the license", async () => {
    const user = userEvent.setup()
    renderDialog()
    const dialog = await openDialog(user)
    expect(dialog.getByLabelText("Expiration date")).toHaveValue("2027-03-01")
  })

  it("submits the edit, invalidates queries, and closes on success", async () => {
    updateLicense.mockResolvedValueOnce({ data: license, status: "success" })
    const user = userEvent.setup()
    renderDialog()
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

    const dialog = await openDialog(user)
    await user.click(dialog.getByRole("button", { name: "Save changes" }))

    await waitFor(() => {
      expect(updateLicense).toHaveBeenCalledWith({
        expiresAt: "2027-03-01",
        licenseId: "license-1",
        renewalCycleMonths: 24,
      })
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: LICENSES_QUERY_KEY })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: DASHBOARD_QUERY_KEY,
    })
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("surfaces the server error message and stays open", async () => {
    updateLicense.mockResolvedValueOnce({
      code: "NOT_FOUND",
      message: "License not found.",
      status: "error",
    })
    const user = userEvent.setup()
    renderDialog()

    const dialog = await openDialog(user)
    await user.click(dialog.getByRole("button", { name: "Save changes" }))

    expect(await dialog.findByRole("alert")).toHaveTextContent(
      "License not found."
    )
  })
})
