import "server-only"

import { env } from "@repo/env/blob"
import { issueSignedToken, presignUrl, put } from "@vercel/blob"

/**
 * Uploads certificate bytes as a PRIVATE Vercel Blob. Private blobs are not
 * reachable via their raw URL — they can only be read through a short-lived
 * presigned URL (see {@link presignCertificateUrl}). The Payload storage adapter
 * cannot write private blobs (it is public-only) and targets the public Blob
 * store, so certificates are uploaded through the `@vercel/blob` SDK directly
 * against the private store (`BLOB_PRIVATE_READ_WRITE_TOKEN`) and the returned
 * pathname is stored on the media doc.
 */
export const uploadCertificateBlob = async ({
  buffer,
  contentType,
  filename,
}: {
  readonly buffer: Buffer
  readonly contentType: string
  readonly filename: string
}): Promise<{ pathname: string }> => {
  const { pathname } = await put(filename, buffer, {
    access: "private",
    addRandomSuffix: true,
    contentType,
    token: env.BLOB_PRIVATE_READ_WRITE_TOKEN,
  })
  return { pathname }
}

/**
 * Mints a short-lived presigned GET URL for a private certificate blob, signed
 * with `BLOB_PRIVATE_READ_WRITE_TOKEN`. The URL expires after
 * `BLOB_SIGNED_URL_TTL_SECONDS` (default 300s).
 */
export const presignCertificateUrl = async ({
  pathname,
}: {
  readonly pathname: string
}): Promise<string> => {
  const validUntil = Date.now() + env.BLOB_SIGNED_URL_TTL_SECONDS * 1000
  const signedToken = await issueSignedToken({
    operations: ["get"],
    pathname,
    token: env.BLOB_PRIVATE_READ_WRITE_TOKEN,
    validUntil,
  })
  const { presignedUrl } = await presignUrl(signedToken, {
    access: "private",
    operation: "get",
    pathname,
    validUntil,
  })
  return presignedUrl
}
