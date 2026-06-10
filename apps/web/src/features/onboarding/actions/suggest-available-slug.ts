import "server-only"

import type { Payload } from "payload"
import { isReservedSlug, validateSlugFormat } from "../lib/slug"

const MAX_NUMERIC_SUFFIX = 10

const RANDOM_SUFFIX_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"
const RANDOM_SUFFIX_LENGTH = 4

const randomSuffix = (): string => {
  let result = ""
  const chars = RANDOM_SUFFIX_CHARS
  for (let i = 0; i < RANDOM_SUFFIX_LENGTH; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const isSlugTaken = async (
  payload: Payload,
  slug: string
): Promise<boolean> => {
  const result = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return result.totalDocs > 0
}

const isCandidateUsable = (candidate: string): boolean =>
  validateSlugFormat(candidate) === null && !isReservedSlug(candidate)

export const suggestAvailableSlug = async ({
  payload,
  base,
}: {
  payload: Payload
  base: string
}): Promise<string> => {
  for (let i = 2; i <= MAX_NUMERIC_SUFFIX; i += 1) {
    const candidate = `${base}-${i}`
    if (!isCandidateUsable(candidate)) {
      continue
    }
    const taken = await isSlugTaken(payload, candidate)
    if (!taken) {
      return candidate
    }
  }
  return `${base}-${randomSuffix()}`
}
