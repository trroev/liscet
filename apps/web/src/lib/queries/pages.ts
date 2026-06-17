import "server-only"

import type { Page } from "@repo/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

/**
 * Fetches a single published `Page` by its fixed slug for a literal marketing
 * route. The `_status` filter enforces published-only visibility because the
 * local API runs with `overrideAccess: true`, bypassing collection access.
 */
export const getPublishedPage = async ({
  slug,
}: {
  slug: string
}): Promise<Page | undefined> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "pages",
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
    },
  })
  return result.docs[0]
}

/** Fetches every published `Page` for dynamic sitemap enumeration. */
export const getPublishedPages = async (): Promise<Array<Page>> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: "published" } },
  })
  return result.docs
}
