import "server-only"

import { summarizeLicenseFromRows } from "@repo/payload/evaluation"
import { practitionerData } from "@repo/payload/queries/practitioner-data"
import { getPayload } from "payload"
import config from "~/payload.config"
import type { DashboardData, LicenseSummaryView } from "./types"

/**
 * Aggregate a practitioner's active licenses into per-license progress
 * summaries for the dashboard. The Payload-row-to-engine glue lives behind
 * `summarizeLicenseFromRows`; `summary` is null when no rule set ships for the
 * license's state + license type.
 */
export const getDashboardData = async (
  practitionerId: string,
  today: Date
): Promise<DashboardData> => {
  const payload = await getPayload({ config })
  const data = practitionerData({ payload, practitionerId })
  const activeLicenses = await data.activeLicenses()

  const licenses = await Promise.all(
    activeLicenses.map(async (license): Promise<LicenseSummaryView> => {
      const creditRows = await data.creditsForLicense(license.id)
      return {
        id: license.id,
        licenseNumber: license.licenseNumber,
        licenseType: license.licenseType,
        state: license.state,
        summary: summarizeLicenseFromRows({
          creditRows,
          license,
          today,
        }),
      }
    })
  )

  return { licenses }
}
