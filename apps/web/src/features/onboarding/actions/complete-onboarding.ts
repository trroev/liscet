"use server"

import "server-only"

import { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { findLicenseOption } from "../lib/license-options"
import {
  EXPIRY_AFTER_ISSUE_ERROR,
  isExpiryAfterIssue,
  onboardingFields,
} from "../lib/schema"
import {
  formatSlug,
  isReservedSlug,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  validateSlugFormat,
} from "../lib/slug"
import type {
  CompleteOnboardingInput,
  CompleteOnboardingResult,
} from "../lib/types"
import { suggestAvailableSlug } from "./suggest-available-slug"

export type {
  CompleteOnboardingData,
  CompleteOnboardingErrorCode,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
} from "../lib/types"

const inputSchema = z
  .object({
    ...onboardingFields,
    slug: z
      .string()
      .min(SLUG_MIN_LENGTH, "Slug is too short.")
      .max(SLUG_MAX_LENGTH, "Slug is too long."),
  })
  .refine(isExpiryAfterIssue, EXPIRY_AFTER_ISSUE_ERROR)

const isUniqueConstraintViolation = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("unique") ||
      message.includes("duplicate key") ||
      message.includes("users_slug_idx")
    )
  }
  return false
}

export const completeOnboarding: (
  input: CompleteOnboardingInput
) => Promise<CompleteOnboardingResult> = authedAction(
  inputSchema,
  async ({ user, payload, input }): Promise<CompleteOnboardingResult> => {
    const slug = formatSlug(input.slug)
    if (validateSlugFormat(slug) !== null) {
      return {
        status: "error",
        code: "SLUG_INVALID",
        message:
          "Slug must be 2–40 characters of lowercase letters, numbers, and single hyphens.",
      }
    }

    if (isReservedSlug(slug)) {
      const suggestion = await suggestAvailableSlug({ base: slug, payload })
      return {
        status: "error",
        code: "SLUG_RESERVED",
        message: "That slug is reserved. Try another.",
        suggestion,
      }
    }

    try {
      await payload.update({
        collection: "users",
        data: { slug },
        id: user.id,
        overrideAccess: true,
      })
    } catch (cause) {
      if (isUniqueConstraintViolation(cause)) {
        const suggestion = await suggestAvailableSlug({ base: slug, payload })
        return {
          status: "error",
          code: "SLUG_TAKEN",
          message: "That slug is taken. Try another.",
          suggestion,
        }
      }
      throw cause
    }

    const option = findLicenseOption(input.licenseOption)
    if (!option) {
      return {
        status: "error",
        code: "INVALID_INPUT",
        message: "Select a state and license type.",
      }
    }

    await payload.create({
      collection: "licenses",
      data: {
        expiresAt: input.expiresAt,
        issuedAt: input.issuedAt,
        licenseNumber: input.licenseNumber.trim(),
        licenseType: option.licenseType,
        practitioner: user.id,
        state: option.state,
        status: "active",
      },
      overrideAccess: true,
    })

    return {
      status: "success",
      data: { userSlug: slug },
    }
  }
)
