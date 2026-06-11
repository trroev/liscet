import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"
import { preview } from "@repo/storybook-config/preview"
import type { LicenseSummaryView } from "../../lib/types"
import { LicenseProgressCard } from "./license-progress-card"

const TODAY = new Date("2026-06-11T00:00:00.000Z")
const RENEWS_SOON = new Date("2026-07-01T00:00:00.000Z")
const RENEWS_LATER = new Date("2027-06-11T00:00:00.000Z")

const summary = (overrides: Partial<ProgressSummary>): ProgressSummary => ({
  categoryProgress: [],
  formatConstraintProgress: [],
  isComplete: false,
  providerCapProgress: [],
  renewsAt: RENEWS_LATER,
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

const meta = preview.meta({
  args: { today: TODAY, userSlug: "trevor" },
  component: LicenseProgressCard,
  parameters: { layout: "padded" },
  title: "Features/Dashboard/LicenseProgressCard",
})

export const InProgress = meta.story({
  args: {
    view: view(
      summary({
        categoryProgress: [
          { category: "law-and-ethics", credited: 3, required: 6 },
          { category: "clinical", credited: 9, required: 20 },
        ],
        totalCreditedHours: 12,
      })
    ),
  },
})

export const Complete = meta.story({
  args: {
    view: view(
      summary({
        categoryProgress: [
          { category: "law-and-ethics", credited: 6, required: 6 },
        ],
        isComplete: true,
        totalCreditedHours: 40,
      })
    ),
  },
})

export const DueSoon = meta.story({
  args: {
    view: view(
      summary({
        categoryProgress: [
          { category: "law-and-ethics", credited: 5, required: 6 },
        ],
        renewsAt: RENEWS_SOON,
        totalCreditedHours: 34,
      })
    ),
  },
})

export const EmptyFirstRun = meta.story({
  args: { view: view(summary({})) },
})
