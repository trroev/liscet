import "server-only"

import { summarizeLicenseFromRows } from "@repo/payload/evaluation"
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
  const licensesResult = await payload.find({
    collection: "licenses",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { practitioner: { equals: practitionerId } },
        { status: { equals: "active" } },
      ],
    },
  })

  const licenses = await Promise.all(
    licensesResult.docs.map(async (license): Promise<LicenseSummaryView> => {
      const creditsResult = await payload.find({
        collection: "course-credits",
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { license: { equals: license.id } },
      })
      return {
        id: license.id,
        licenseNumber: license.licenseNumber,
        licenseType: license.licenseType,
        state: license.state,
        summary: summarizeLicenseFromRows({
          creditRows: creditsResult.docs,
          license,
          today,
        }),
      }
    })
  )

  return { licenses }
}
