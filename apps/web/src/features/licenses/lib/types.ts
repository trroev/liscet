import type { License } from "@repo/payload/payload-types"

export type LicenseView = {
  id: string
  state: License["state"]
  licenseType: string
  licenseNumber: string
  status: License["status"]
  issuedAt: string
  expiresAt: string
  renewalCycleMonths: number
}

export type LicensesData = {
  licenses: Array<LicenseView>
}

export type UpdateLicenseInput = {
  licenseId: string
  expiresAt: string
  renewalCycleMonths: number
}
