"use server"

import "server-only"

import { slugTaken } from "@repo/payload/queries/practitioner-data"
import { authedAction } from "~/lib/authed-action"
import { formatSlug, isReservedSlug, validateSlugFormat } from "../lib/slug"
import type { CheckSlugAvailabilityResult } from "../lib/types"
import { suggestAvailableSlug } from "./suggest-available-slug"

export type {
  CheckSlugAvailabilityResult,
  SlugAvailabilityData,
  SlugAvailabilityReason,
} from "../lib/types"

export const checkSlugAvailability = authedAction<
  string,
  CheckSlugAvailabilityResult
>(async ({ payload, input: rawSlug }) => {
  const slug = formatSlug(rawSlug)

  if (validateSlugFormat(slug) !== null) {
    return {
      status: "success",
      data: { available: false, reason: "format" },
    }
  }

  if (isReservedSlug(slug)) {
    const suggestion = await suggestAvailableSlug({ base: slug, payload })
    return {
      status: "success",
      data: { available: false, reason: "reserved", suggestion },
    }
  }

  if (!(await slugTaken({ payload, slug }))) {
    return { status: "success", data: { available: true } }
  }

  const suggestion = await suggestAvailableSlug({ base: slug, payload })
  return {
    status: "success",
    data: { available: false, reason: "taken", suggestion },
  }
})
