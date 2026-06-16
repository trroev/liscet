import { env } from "@repo/env/blob"
import { createLogger } from "@repo/logger"
import { del } from "@vercel/blob"
import type { CollectionBeforeDeleteHook } from "payload"

const log = createLogger({ name: "payload.delete-media-blob" })

/**
 * Removes the backing private blob when a media doc is deleted. Only certificate
 * docs carry a `blobPathname` (avatars are adapter-managed public blobs cleaned
 * up by the storage plugin), so docs without one are a no-op. Best-effort: a
 * failed delete is logged but never blocks the doc deletion, mirroring the
 * tolerance of `deleteMediaAsset`.
 */
export const deleteMediaBlob: CollectionBeforeDeleteHook = async ({
  id,
  req,
}): Promise<void> => {
  const media = await req.payload.findByID({
    collection: "media",
    depth: 0,
    disableErrors: true,
    id,
    overrideAccess: true,
    req,
  })

  const pathname = media?.blobPathname
  if (!pathname) {
    return
  }

  try {
    await del(pathname, { token: env.BLOB_READ_WRITE_TOKEN })
  } catch (error) {
    log.withError(error).warn("failed to delete private certificate blob")
  }
}
