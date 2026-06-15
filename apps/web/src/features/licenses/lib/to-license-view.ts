import type { License } from "@repo/payload/payload-types"
import { DEFAULT_RENEWAL_CYCLE_MONTHS } from "./renewal-cycle"
import type { LicenseView } from "./types"

export const toLicenseView = (license: License): LicenseView => ({
  expiresAt: license.expiresAt,
  id: license.id,
  issuedAt: license.issuedAt,
  licenseNumber: license.licenseNumber,
  licenseType: license.licenseType,
  renewalCycleMonths:
    license.renewalCycleMonths ?? DEFAULT_RENEWAL_CYCLE_MONTHS,
  state: license.state,
  status: license.status,
})
