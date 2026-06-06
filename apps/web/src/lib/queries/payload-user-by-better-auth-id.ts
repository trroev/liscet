import "server-only"

import type { User } from "@repo/payload/payload-types"
import { getPayload } from "payload"
import { cache } from "react"
import config from "~/payload.config"

/**
 * Looks up the Payload `users` document linked to a better-auth user ID.
 *
 * Uses `overrideAccess: true` because the linkage field (`betterAuthId`) is
 * not exposed by the public `users` collection access rules. Callers MUST
 * verify the better-auth session before invoking, so that the lookup is
 * scoped to the currently-authenticated identity rather than an arbitrary
 * caller-supplied ID.
 */
export const getPayloadUserByBetterAuthId = cache(
  async (betterAuthId: string): Promise<User | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "users",
      where: { betterAuthId: { equals: betterAuthId } },
      limit: 1,
      overrideAccess: true,
    })
    return docs[0] ?? null
  }
)
