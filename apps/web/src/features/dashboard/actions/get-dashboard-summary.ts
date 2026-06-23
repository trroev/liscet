"use server"

import "server-only"

import { requireViewer } from "~/lib/queries/current-viewer"
import { getDashboardData } from "../lib/get-dashboard-data"
import type { DashboardData } from "../lib/types"

export type { DashboardData, LicenseSummaryView } from "../lib/types"

/**
 * Server action used as the TanStack Query `queryFn` for client-side
 * revalidation of the dashboard after a course is logged (#27 wires the
 * invalidation trigger). Re-resolves the viewer so the action is self-securing.
 */
export const getDashboardSummary = async (): Promise<DashboardData> => {
  const { user } = await requireViewer({ onboarded: true })
  return getDashboardData(user.id, new Date())
}
