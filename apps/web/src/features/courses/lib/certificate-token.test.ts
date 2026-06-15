import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@repo/env/auth", () => ({
  env: { BETTER_AUTH_SECRET: "test-secret" },
}))

import {
  signCertificateToken,
  verifyCertificateToken,
} from "./certificate-token"

const futureExpiry = (): number => Date.now() + 60_000

describe("certificate-token", () => {
  it("should round-trip a signed payload", () => {
    const payload = { expiresAt: futureExpiry(), mediaId: "media-1" }

    const token = signCertificateToken(payload)

    expect(verifyCertificateToken({ token })).toEqual(payload)
  })

  it("should reject a tampered body", () => {
    const token = signCertificateToken({
      expiresAt: futureExpiry(),
      mediaId: "media-1",
    })
    const [, signature] = token.split(".")
    const forgedBody = Buffer.from(
      JSON.stringify({ expiresAt: futureExpiry(), mediaId: "media-2" })
    ).toString("base64url")

    expect(
      verifyCertificateToken({ token: `${forgedBody}.${signature}` })
    ).toBeNull()
  })

  it("should reject a tampered signature", () => {
    const token = signCertificateToken({
      expiresAt: futureExpiry(),
      mediaId: "media-1",
    })
    const [body] = token.split(".")

    expect(verifyCertificateToken({ token: `${body}.invalid` })).toBeNull()
  })

  it("should reject an expired token", () => {
    const token = signCertificateToken({
      expiresAt: Date.now() - 1,
      mediaId: "media-1",
    })

    expect(verifyCertificateToken({ token })).toBeNull()
  })

  it("should reject malformed tokens", () => {
    expect(verifyCertificateToken({ token: "" })).toBeNull()
    expect(verifyCertificateToken({ token: "no-separator" })).toBeNull()
    expect(verifyCertificateToken({ token: "a.b.c" })).toBeNull()
    expect(verifyCertificateToken({ token: "not-json.signature" })).toBeNull()
  })
})
