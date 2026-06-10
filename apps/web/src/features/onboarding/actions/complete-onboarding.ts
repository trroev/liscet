"use server"

import "server-only"

import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"
import { getPayload } from "payload"
import { z } from "zod"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import config from "~/payload.config"
import {
  findLicenseOption,
  LICENSE_OPTION_VALUES,
  type LicenseOptionValue,
} from "../lib/license-options"
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
    expiresAt: z.iso.date("Enter a valid expiration date."),
    issuedAt: z.iso.date("Enter a valid issue date."),
    licenseNumber: z.string().trim().min(1, "Enter your license number."),
    licenseOption: z.enum(
      LICENSE_OPTION_VALUES as ReadonlyArray<LicenseOptionValue>,
      "Select a state and license type."
    ),
    slug: z
      .string()
      .min(SLUG_MIN_LENGTH, "Slug is too short.")
      .max(SLUG_MAX_LENGTH, "Slug is too long."),
  })
  .refine((data) => Date.parse(data.expiresAt) > Date.parse(data.issuedAt), {
    message: "Expiration date must be after the issue date.",
    path: ["expiresAt"],
  })

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

const completeOnboardingImpl = async (
  rawInput: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return {
      status: "error",
      code: "UNAUTHENTICATED",
      message: "You must be signed in.",
    }
  }

  const parsed = inputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message ?? "Check the form and retry.",
    }
  }

  const slug = formatSlug(parsed.data.slug)
  if (validateSlugFormat(slug) !== null) {
    return {
      status: "error",
      code: "SLUG_INVALID",
      message:
        "Slug must be 2–40 characters of lowercase letters, numbers, and single hyphens.",
    }
  }

  const payload = await getPayload({ config })

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
      id: viewer.user.id,
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

  const option = findLicenseOption(parsed.data.licenseOption)
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
      expiresAt: parsed.data.expiresAt,
      issuedAt: parsed.data.issuedAt,
      licenseNumber: parsed.data.licenseNumber.trim(),
      licenseType: option.licenseType,
      practitioner: viewer.user.id,
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

export const completeOnboarding = async (
  input: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> => {
  try {
    return await completeOnboardingImpl(input)
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      status: "error",
    }
  }
}
