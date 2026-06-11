import type { ProgressSummary } from "@repo/rules-engine/types/ProgressSummary"

export type LicenseSummaryView = {
  id: string
  state: string
  licenseType: string
  licenseNumber: string
  /** Null when the license's state + license type has no shipped rule set. */
  summary: ProgressSummary | null
}

export type DashboardData = {
  licenses: Array<LicenseSummaryView>
}
