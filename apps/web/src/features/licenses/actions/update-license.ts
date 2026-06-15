"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { isRenewalCycleMonths } from "../lib/renewal-cycle"
import { toLicenseView } from "../lib/to-license-view"
import type { LicenseView } from "../lib/types"

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

export const updateLicense = authedAction(
  inputSchema,
  async ({ user, payload, input }): Promise<ActionResult<LicenseView>> => {
    const existing = await payload.findByID({
      collection: "licenses",
      disableErrors: true,
      depth: 0,
      id: input.licenseId,
      overrideAccess: true,
    })

    if (!existing || refId(existing.practitioner) !== user.id) {
      return {
        code: "NOT_FOUND",
        message: "License not found.",
        status: "error",
      }
    }

    const updated = await payload.update({
      collection: "licenses",
      data: {
        expiresAt: input.expiresAt,
        renewalCycleMonths: input.renewalCycleMonths,
      },
      id: input.licenseId,
      overrideAccess: true,
    })

    return { data: toLicenseView(updated), status: "success" }
  }
)
