// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, screen } from "@testing-library/react"
import type React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { LicensesData } from "../../lib/types"

vi.mock("../../actions/get-licenses", () => ({
  getLicenses: vi.fn(),
}))

vi.mock("../../actions/update-license", () => ({
  updateLicense: vi.fn(),
}))

const { LicensesView } = await import("./licenses-view")

const renderView = (data: LicensesData): void => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  })
  const wrapper = (children: React.ReactNode): React.JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  renderWithProviders(
    wrapper(
      <LicensesView initialData={data} nowIso="2026-06-15T00:00:00.000Z" />
    )
  )
}

afterEach(() => {
  cleanup()
})

describe("LicensesView", () => {
  it("renders a card per license, including non-active ones", () => {
    renderView({
      licenses: [
        {
          expiresAt: "2027-03-01T00:00:00.000Z",
          id: "license-1",
          issuedAt: "2025-03-01T00:00:00.000Z",
          licenseNumber: "ABC-123",
          licenseType: "LCSW",
          renewalCycleMonths: 24,
          state: "CA",
          status: "active",
        },
        {
          expiresAt: "2025-01-01T00:00:00.000Z",
          id: "license-2",
          issuedAt: "2023-01-01T00:00:00.000Z",
          licenseNumber: "XYZ-789",
          licenseType: "LICSW",
          renewalCycleMonths: 24,
          state: "MA",
          status: "lapsed",
        },
      ],
    })
    expect(screen.getByText("California — LCSW")).toBeInTheDocument()
    expect(screen.getByText("Massachusetts — LICSW")).toBeInTheDocument()
    expect(screen.getByText("Lapsed")).toBeInTheDocument()
    expect(screen.getByText("Overdue")).toBeInTheDocument()
  })

  it("shows an empty state when the practitioner has no licenses", () => {
    renderView({ licenses: [] })
    expect(
      screen.getByText("You don't have any licenses yet.")
    ).toBeInTheDocument()
  })
})
