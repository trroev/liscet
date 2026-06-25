// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@repo/testing/render"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { requestDataExport, success } = vi.hoisted(() => ({
  requestDataExport: vi.fn(),
  success: vi.fn(),
}))

vi.mock("../../actions/request-data-export", () => ({
  requestDataExport,
}))

vi.mock("@repo/ui/components/Toast", () => ({
  toast: { success },
}))

import { DataExportRow } from "./data-export-row"

describe("DataExportRow", () => {
  beforeEach(() => {
    requestDataExport.mockReset()
    success.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("should confirm that a download link was emailed on success", async () => {
    requestDataExport.mockResolvedValueOnce({
      status: "success",
      data: undefined,
    })
    const user = userEvent.setup()
    render(<DataExportRow />)

    await user.click(screen.getByRole("button", { name: "Export data" }))

    await waitFor(() => {
      expect(success).toHaveBeenCalledOnce()
    })
    expect(requestDataExport).toHaveBeenCalledTimes(1)
  })

  it("should surface a server error", async () => {
    requestDataExport.mockResolvedValueOnce({
      status: "error",
      message: "Something went wrong. Please try again.",
    })
    const user = userEvent.setup()
    render(<DataExportRow />)

    await user.click(screen.getByRole("button", { name: "Export data" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again."
    )
  })
})
