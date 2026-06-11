// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"
import { renderWithProviders } from "@repo/testing/render"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, screen } from "@testing-library/react"
import type React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { DashboardData } from "../../lib/types"

vi.mock("../../actions/get-dashboard-summary", () => ({
  getDashboardSummary: vi.fn(),
}))

const { DashboardView } = await import("./dashboard-view")

const summary: ProgressSummary = {
  categoryProgress: [],
  formatConstraintProgress: [],
  isComplete: false,
  providerCapProgress: [],
  renewsAt: new Date("2027-06-11T00:00:00.000Z"),
  requiredHours: 40,
  specialRequirementProgress: [],
  totalCreditedHours: 0,
}

const renderView = (data: DashboardData): void => {
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
      <DashboardView
        initialData={data}
        nowIso="2026-06-11T00:00:00.000Z"
        userSlug="trevor"
      />
    )
  )
}

afterEach(() => {
  cleanup()
})

describe("DashboardView", () => {
  it("renders a card per license from initial data", () => {
    renderView({
      licenses: [
        {
          id: "license-1",
          licenseNumber: "ABC-123",
          licenseType: "LCSW",
          state: "CA",
          summary,
        },
      ],
    })
    expect(screen.getByText("California — LCSW")).toBeInTheDocument()
  })

  it("shows an add-license prompt when there are no active licenses", () => {
    renderView({ licenses: [] })
    const cta = screen.getByRole("link", { name: "Add a license" })
    expect(cta).toHaveAttribute("href", "/trevor/licenses")
  })
})
