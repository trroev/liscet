"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { getPayload } from "payload"
import { z } from "zod"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"
import { isRenewalCycleMonths } from "../lib/renewal-cycle"
import { toLicenseView } from "../lib/to-license-view"
import type { LicenseView, UpdateLicenseInput } from "../lib/types"

export type { LicenseView, UpdateLicenseInput } from "../lib/types"

const inputSchema = z.object({
  expiresAt: z.iso.date("Enter a valid expiration date."),
  licenseId: z.string().min(1, "A license is required."),
  renewalCycleMonths: z
    .number()
    .refine(isRenewalCycleMonths, "Select a valid renewal cycle."),
})

const refId = (ref: string | { id: string }): string =>
  typeof ref === "string" ? ref : ref.id

const updateLicenseImpl = async (
  rawInput: UpdateLicenseInput
): Promise<ActionResult<LicenseView>> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return {
      code: "UNAUTHENTICATED",
      message: "You must be signed in.",
      status: "error",
    }
  }

  const parsed = inputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message ?? "Check the form and retry.",
      status: "error",
    }
  }

  const payload = await getPayload({ config })

  const existing = await payload.findByID({
    collection: "licenses",
    disableErrors: true,
    depth: 0,
    id: parsed.data.licenseId,
    overrideAccess: true,
  })

  if (!existing || refId(existing.practitioner) !== viewer.user.id) {
    return {
      code: "NOT_FOUND",
      message: "License not found.",
      status: "error",
    }
  }

  const updated = await payload.update({
    collection: "licenses",
    data: {
      expiresAt: parsed.data.expiresAt,
      renewalCycleMonths: parsed.data.renewalCycleMonths,
    },
    id: parsed.data.licenseId,
    overrideAccess: true,
  })

  return { data: toLicenseView(updated), status: "success" }
}

export const updateLicense = serverAction(updateLicenseImpl)
