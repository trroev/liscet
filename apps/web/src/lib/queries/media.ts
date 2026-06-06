import "server-only"

import { getPayload } from "payload"
import config from "~/payload.config"

type CreateMediaAssetInput = {
  file: File
  alt: string
  fallbackName?: string
}

/**
 * Uploads a file to the `media` collection.
 *
 * Uses `overrideAccess: true` because the public `media` collection access
 * rules disallow direct creation. Callers MUST verify the requesting session
 * AND authorize the upload via a policy before invoking — see
 * `lib/actions/avatar.ts` for an example.
 */
export const createMediaAsset = async ({
  file,
  alt,
  fallbackName,
}: CreateMediaAssetInput): Promise<{ id: string; url: string | null }> => {
  const payload = await getPayload({ config })
  const buffer = Buffer.from(await file.arrayBuffer())
  const media = await payload.create({
    collection: "media",
    data: { alt },
    file: {
      data: buffer,
      mimetype: file.type || "application/octet-stream",
      name: file.name || fallbackName || "upload",
      size: file.size,
    },
    overrideAccess: true,
  })
  return { id: String(media.id), url: media.url ?? null }
}

/**
 * Deletes a media document by ID, swallowing not-found errors.
 *
 * Uses `overrideAccess: true` because the action-level authorization has
 * already confirmed the caller owns the referencing record. Used for
 * best-effort cleanup of orphaned media (e.g. previous avatar replaced by
 * a new upload) — see `lib/actions/avatar.ts`.
 */
export const deleteMediaAsset = async (id: string): Promise<void> => {
  const payload = await getPayload({ config })
  await payload
    .delete({ collection: "media", id, overrideAccess: true })
    .catch(() => {
      // Best-effort cleanup: ignore if the asset is already gone.
    })
}
