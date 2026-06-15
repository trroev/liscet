import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { env } from "@repo/env/auth"
import { z } from "zod"

const TOKEN_PREFIX = "liscet:certificate:v1"

export const CERTIFICATE_LINK_TTL_MS = 5 * 60 * 1000

const certificateTokenPayloadSchema = z.object({
  expiresAt: z.number().int().positive(),
  mediaId: z.string().min(1),
})

export type CertificateTokenPayload = z.infer<
  typeof certificateTokenPayloadSchema
>

const signBody = (body: string): string =>
  createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`${TOKEN_PREFIX}.${body}`)
    .digest("base64url")

export const signCertificateToken = ({
  expiresAt,
  mediaId,
}: CertificateTokenPayload): string => {
  const body = Buffer.from(JSON.stringify({ expiresAt, mediaId })).toString(
    "base64url"
  )
  return `${body}.${signBody(body)}`
}

/**
 * Verifies a certificate download token: signature (timing-safe), payload
 * shape, and expiry. Returns the payload on success, null on any failure.
 */
export const verifyCertificateToken = ({
  token,
}: {
  token: string
}): CertificateTokenPayload | null => {
  const [body, signature, ...rest] = token.split(".")
  if (!(body && signature) || rest.length > 0) {
    return null
  }

  const expectedSignature = Buffer.from(signBody(body))
  const providedSignature = Buffer.from(signature)
  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return null
  }

  let decoded: unknown
  try {
    decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
  } catch {
    return null
  }

  const parsed = certificateTokenPayloadSchema.safeParse(decoded)
  if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
    return null
  }
  return parsed.data
}
