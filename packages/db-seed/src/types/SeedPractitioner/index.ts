import type { License } from "@repo/payload/payload-types"

export type SeedLicense = {
  readonly state: License["state"]
  readonly licenseType: string
  readonly licenseNumber: string
  readonly issuedAt: string
  readonly expiresAt: string
  readonly status: License["status"]
  readonly renewalCycleMonths: number
  readonly coTelehealth?: {
    readonly isRegistered: true
    readonly registrationNumber: string
    readonly expiresAt: string
  }
}

export type SeedCourse = {
  readonly title: string
  readonly provider: string
  readonly completedAt: string
  readonly hours: number
  readonly subjectCategories: ReadonlyArray<string>
  readonly format: "live" | "home-study" | "in-person"
}

export type SeedPractitioner = {
  readonly email: string
  readonly password: string
  readonly displayName: string
  readonly timezone: string
  readonly license: SeedLicense
  readonly courses: ReadonlyArray<SeedCourse>
}
