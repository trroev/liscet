import "server-only"

import { getPayload } from "payload"
import config from "~/payload.config"

type SetUserDeletedAtInput = {
  userId: string
  deletedAt: string | null
}

/**
 * Sets (or clears) the `deletedAt` soft-delete marker on a Payload user.
 *
 * Uses `overrideAccess: true` because the `users` collection is admin-only.
 * Callers MUST resolve `userId` from the current viewer so the update is
 * always scoped to the authenticated identity.
 */
export const setUserDeletedAt = async ({
  userId,
  deletedAt,
}: SetUserDeletedAtInput): Promise<void> => {
  const payload = await getPayload({ config })
  await payload.update({
    collection: "users",
    id: userId,
    data: { deletedAt },
    overrideAccess: true,
  })
}
