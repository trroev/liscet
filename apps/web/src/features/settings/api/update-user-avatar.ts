import "server-only"

import { getPayload } from "payload"
import config from "~/payload.config"

type UpdateUserAvatarInput = {
  userId: string
  mediaId: string | null
}

/**
 * Sets (or clears) the `avatar` relation on a Payload user.
 *
 * Uses `overrideAccess: true` because the public `users` collection access
 * does not expose the `avatar` field for self-update through normal API
 * routes. Callers MUST resolve `userId` from the current better-auth session
 * via `getPayloadUserByBetterAuthId`, so the update is always scoped to the
 * authenticated identity.
 */
export const updateUserAvatar = async ({
  userId,
  mediaId,
}: UpdateUserAvatarInput): Promise<void> => {
  const payload = await getPayload({ config })
  await payload.update({
    collection: "users",
    id: userId,
    data: { avatar: mediaId },
    overrideAccess: true,
  })
}
