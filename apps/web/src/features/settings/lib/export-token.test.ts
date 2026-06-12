import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@repo/env/auth", () => ({
  env: { BETTER_AUTH_SECRET: "test-secret" },
}))

import { signExportToken, verifyExportToken } from "./export-token"

const futureExpiry = (): number => Date.now() + 60_000

describe("export-token", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should round-trip a signed payload", () => {
    const payload = {
      expiresAt: futureExpiry(),
      pathname: "data-exports/user-1-abc.json",
    }

    const token = signExportToken(payload)

    expect(verifyExportToken({ token })).toEqual(payload)
  })

  it("should reject a tampered body", () => {
    const token = signExportToken({
      expiresAt: futureExpiry(),
      pathname: "data-exports/user-1.json",
    })
    const [, signature] = token.split(".")
    const forgedBody = Buffer.from(
      JSON.stringify({
        expiresAt: futureExpiry(),
        pathname: "data-exports/user-2.json",
      })
    ).toString("base64url")

    expect(
      verifyExportToken({ token: `${forgedBody}.${signature}` })
    ).toBeNull()
  })

  it("should reject a tampered signature", () => {
    const token = signExportToken({
      expiresAt: futureExpiry(),
      pathname: "data-exports/user-1.json",
    })
    const [body] = token.split(".")

    expect(verifyExportToken({ token: `${body}.invalid` })).toBeNull()
  })

  it("should reject an expired token", () => {
    const token = signExportToken({
      expiresAt: Date.now() - 1,
      pathname: "data-exports/user-1.json",
    })

    expect(verifyExportToken({ token })).toBeNull()
  })

  it("should reject malformed tokens", () => {
    expect(verifyExportToken({ token: "" })).toBeNull()
    expect(verifyExportToken({ token: "no-separator" })).toBeNull()
    expect(verifyExportToken({ token: "a.b.c" })).toBeNull()
    expect(verifyExportToken({ token: "not-json.signature" })).toBeNull()
  })
})
