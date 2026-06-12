// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"
import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import type { LicenseSummaryView } from "../../lib/types"
import { LicenseProgressCard } from "./license-progress-card"

const TODAY = new Date("2026-06-11T00:00:00.000Z")
const RENEWS_AT = new Date("2027-06-11T00:00:00.000Z")
const RULES_UNAVAILABLE_RE =
  /progress tracking for this license isn't available/i

const summary = (
  overrides: Partial<ProgressSummary> = {}
): ProgressSummary => ({
  categoryProgress: [],
  formatConstraintProgress: [],
  isComplete: false,
  providerCapProgress: [],
  renewsAt: RENEWS_AT,
  requiredHours: 40,
  specialRequirementProgress: [],
  totalCreditedHours: 0,
  ...overrides,
})

const view = (summaryValue: ProgressSummary | null): LicenseSummaryView => ({
  id: "license-1",
  licenseNumber: "ABC-123",
  licenseType: "LCSW",
  state: "CA",
  summary: summaryValue,
})

afterEach(() => {
  cleanup()
})

describe("LicenseProgressCard", () => {
  it("renders the license label and an in-progress state", () => {
    renderWithProviders(
      <LicenseProgressCard
        today={TODAY}
        userSlug="trevor"
        view={view(
          summary({
            categoryProgress: [
              { category: "law-and-ethics", credited: 3, required: 6 },
            ],
            totalCreditedHours: 12,
          })
        )}
      />
    )
    expect(screen.getByText("California — LCSW")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
    expect(screen.getByText("12 / 40 hrs")).toBeInTheDocument()
    expect(screen.getByText("Law And Ethics")).toBeInTheDocument()
  })

  it("shows the first-course CTA when no hours are credited", () => {
    renderWithProviders(
      <LicenseProgressCard
        today={TODAY}
        userSlug="trevor"
        view={view(summary())}
      />
    )
    const cta = screen.getByRole("button", { name: "Log your first course" })
    expect(cta).toHaveAttribute("href", "/trevor/courses/new")
  })

  it("marks a complete license", () => {
    renderWithProviders(
      <LicenseProgressCard
        today={TODAY}
        userSlug="trevor"
        view={view(summary({ isComplete: true, totalCreditedHours: 40 }))}
      />
    )
    expect(screen.getByText("Complete")).toBeInTheDocument()
  })

  it("renders a fallback when no rule set is available", () => {
    renderWithProviders(
      <LicenseProgressCard today={TODAY} userSlug="trevor" view={view(null)} />
    )
    expect(screen.getByText(RULES_UNAVAILABLE_RE)).toBeInTheDocument()
  })
})
