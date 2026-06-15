import "server-only"

import { practitionerData } from "@repo/payload/queries/practitioner-data"
import { getPayload } from "payload"
import config from "~/payload.config"
import { toLicenseView } from "./to-license-view"
import type { LicensesData } from "./types"

/**
 * Read every license a practitioner holds — regardless of status — for the
 * license management screen. Sorted soonest-expiring first so the most urgent
 * renewal surfaces at the top.
 */
export const getLicensesData = async (
  practitionerId: string
): Promise<LicensesData> => {
  const payload = await getPayload({ config })
  const licenses = await practitionerData({
    payload,
    practitionerId,
  }).licenses()

  return { licenses: licenses.map(toLicenseView) }
}
