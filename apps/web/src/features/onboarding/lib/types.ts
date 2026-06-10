import type { ActionResult } from "@repo/types/ActionResult"
import type { LicenseOptionValue } from "./license-options"

export type SlugAvailabilityReason = "format" | "reserved" | "taken"

export type SlugAvailabilityData = {
  available: boolean
  reason?: SlugAvailabilityReason
  suggestion?: string
}

export type CheckSlugAvailabilityResult = ActionResult<SlugAvailabilityData>

export type CompleteOnboardingErrorCode =
  | "INTERNAL_ERROR"
  | "INVALID_INPUT"
  | "SLUG_INVALID"
  | "SLUG_RESERVED"
  | "SLUG_TAKEN"
  | "UNAUTHENTICATED"

export type CompleteOnboardingData = {
  userSlug: string
}

export type CompleteOnboardingResult = ActionResult<CompleteOnboardingData> & {
  code?: CompleteOnboardingErrorCode
  suggestion?: string
}

export type CompleteOnboardingInput = {
  expiresAt: string
  issuedAt: string
  licenseNumber: string
  licenseOption: LicenseOptionValue
  slug: string
}
