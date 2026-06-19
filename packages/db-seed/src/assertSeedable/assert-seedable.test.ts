import { afterEach, describe, expect, it, vi } from "vitest"
import { assertSeedable } from "./index"

const PRODUCTION_ABORT_PATTERN = /must not run in production/i

describe("assertSeedable", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("allows a Vercel preview even when NODE_ENV is production", () => {
    vi.stubEnv("VERCEL_ENV", "preview")
    vi.stubEnv("NODE_ENV", "production")

    expect(() => assertSeedable()).not.toThrow()
  })

  it("refuses the Vercel production deploy", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("NODE_ENV", "production")

    expect(() => assertSeedable()).toThrow(PRODUCTION_ABORT_PATTERN)
  })

  it("refuses a local NODE_ENV=production run with no VERCEL_ENV", () => {
    vi.stubEnv("VERCEL_ENV", "")
    vi.stubEnv("NODE_ENV", "production")

    expect(() => assertSeedable()).toThrow(PRODUCTION_ABORT_PATTERN)
  })

  it("allows local development", () => {
    vi.stubEnv("VERCEL_ENV", "")
    vi.stubEnv("NODE_ENV", "development")

    expect(() => assertSeedable()).not.toThrow()
  })
})
