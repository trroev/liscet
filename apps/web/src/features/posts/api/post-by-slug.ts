import "server-only"

import type { Post } from "@repo/payload/payload-types"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"
import { cache } from "react"
import config from "~/payload.config"

export const postBySlugCacheTag = (slug: string): string => `post:${slug}`

export const getPostBySlug = (slug: string): Promise<Post | null> =>
  unstable_cache(
    async (): Promise<Post | null> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: "posts",
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: "published" } },
          ],
        },
        depth: 2,
        limit: 1,
      })
      return docs[0] ?? null
    },
    ["post-by-slug", slug],
    { tags: [postBySlugCacheTag(slug)] }
  )()

export const getDraftPostBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      draft: true,
      overrideAccess: true,
    })
    return docs[0] ?? null
  }
)
