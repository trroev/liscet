import "server-only"

import type { Post } from "@repo/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

export const getPublishedPosts = async (): Promise<Array<Post>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    depth: 1,
    limit: 0,
  })
  return docs
}
