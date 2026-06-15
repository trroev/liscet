"use server"

import "server-only"

import { requireOnboardedViewer } from "~/lib/queries/require-onboarded-viewer"
import { getLicensesData } from "../lib/get-licenses-data"
import type { LicensesData } from "../lib/types"

export type { LicensesData, LicenseView } from "../lib/types"

/**
 * Server action used as the TanStack Query `queryFn` for client-side
 * revalidation of the licenses screen after an edit. Re-resolves the viewer so
 * the action is self-securing.
 */
export const getLicenses = async (): Promise<LicensesData> => {
  const { user } = await requireOnboardedViewer()
  return getLicensesData(user.id)
}
