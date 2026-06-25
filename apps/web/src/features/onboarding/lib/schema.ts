import { z } from "zod"
import {
  LICENSE_OPTION_VALUES,
  type LicenseOptionValue,
} from "./license-options"

export const onboardingFields = {
  expiresAt: z.iso.date("Enter a valid expiration date."),
  issuedAt: z.iso.date("Enter a valid issue date."),
  licenseNumber: z.string().trim().min(1, "Enter your license number."),
  licenseOption: z.enum(
    LICENSE_OPTION_VALUES as ReadonlyArray<LicenseOptionValue>,
    "Select a state and license type."
  ),
}

export const isExpiryAfterIssue = (data: {
  expiresAt: string
  issuedAt: string
}): boolean => Date.parse(data.expiresAt) > Date.parse(data.issuedAt)

export const EXPIRY_AFTER_ISSUE_ERROR: {
  message: string
  path: Array<string>
} = {
  message: "Expiration date must be after the issue date.",
  path: ["expiresAt"],
}
