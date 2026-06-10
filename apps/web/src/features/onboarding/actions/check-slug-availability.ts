"use server"

import "server-only"

import { getPayload } from "payload"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"
import { formatSlug, isReservedSlug, validateSlugFormat } from "../lib/slug"
import type { CheckSlugAvailabilityResult } from "../lib/types"
import { suggestAvailableSlug } from "./suggest-available-slug"

export type {
  CheckSlugAvailabilityResult,
  SlugAvailabilityData,
  SlugAvailabilityReason,
} from "../lib/types"

const checkSlugAvailabilityImpl = async (
  rawSlug: string
): Promise<CheckSlugAvailabilityResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }

  const slug = formatSlug(rawSlug)

  if (validateSlugFormat(slug) !== null) {
    return {
      status: "success",
      data: { available: false, reason: "format" },
    }
  }

  const payload = await getPayload({ config })

  if (isReservedSlug(slug)) {
    const suggestion = await suggestAvailableSlug({ base: slug, payload })
    return {
      status: "success",
      data: { available: false, reason: "reserved", suggestion },
    }
  }

  const existing = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })

  if (existing.totalDocs === 0) {
    return { status: "success", data: { available: true } }
  }

  const suggestion = await suggestAvailableSlug({ base: slug, payload })
  return {
    status: "success",
    data: { available: false, reason: "taken", suggestion },
  }
}

export const checkSlugAvailability = serverAction(checkSlugAvailabilityImpl)
