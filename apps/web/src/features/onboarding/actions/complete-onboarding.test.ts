import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CompleteOnboardingInput } from "./complete-onboarding"

const getSession = vi.fn()
const find = vi.fn()
const update = vi.fn()
const create = vi.fn()
const payloadAuth = vi.fn(async () => ({ user: null }))

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadAuth,
    create,
    find,
    update,
  })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))

const stubSession = (userId = "ba-user-1"): void => {
  getSession.mockResolvedValueOnce({ user: { id: userId, email: "u@e.co" } })
}

const stubViewerLookup = (userId = "payload-user-1"): void => {
  find.mockResolvedValueOnce({ docs: [{ id: userId }] })
}

const validInput: CompleteOnboardingInput = {
  expiresAt: "2028-01-01",
  issuedAt: "2026-01-01",
  licenseNumber: "ABC-123",
  licenseOption: "CA-LCSW",
  slug: "trevor-mathiak",
}

describe("completeOnboarding", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    create.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { completeOnboarding } = await import("./complete-onboarding")
    const result = await completeOnboarding(validInput)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("UNAUTHENTICATED")
    }
    expect(update).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects reserved slugs with a suggestion", async () => {
    stubSession()
    stubViewerLookup()
    find.mockResolvedValueOnce({ totalDocs: 0 })
    const { completeOnboarding } = await import("./complete-onboarding")
    const result = await completeOnboarding({ ...validInput, slug: "admin" })
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("SLUG_RESERVED")
      expect(result.suggestion).toBe("admin-2")
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("rejects taken slugs with a suggestion", async () => {
    stubSession()
    stubViewerLookup()
    update.mockRejectedValueOnce(
      new Error(
        'duplicate key value violates unique constraint "users_slug_idx"'
      )
    )
    find.mockResolvedValueOnce({ totalDocs: 0 })
    const { completeOnboarding } = await import("./complete-onboarding")
    const result = await completeOnboarding(validInput)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("SLUG_TAKEN")
      expect(result.suggestion).toBe("trevor-mathiak-2")
    }
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects expiration on or before issue date", async () => {
    stubSession()
    stubViewerLookup()
    const { completeOnboarding } = await import("./complete-onboarding")
    const result = await completeOnboarding({
      ...validInput,
      expiresAt: "2026-01-01",
      issuedAt: "2026-01-01",
    })
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.code).toBe("INVALID_INPUT")
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("persists slug + creates a license on success", async () => {
    stubSession()
    stubViewerLookup("payload-user-1")
    update.mockResolvedValueOnce({})
    create.mockResolvedValueOnce({ id: "license-1" })
    const { completeOnboarding } = await import("./complete-onboarding")
    const result = await completeOnboarding(validInput)
    expect(result).toEqual({
      data: { userSlug: "trevor-mathiak" },
      status: "success",
    })
    expect(update).toHaveBeenCalledWith({
      collection: "users",
      data: { slug: "trevor-mathiak" },
      id: "payload-user-1",
      overrideAccess: true,
    })
    expect(create).toHaveBeenCalledWith({
      collection: "licenses",
      data: {
        expiresAt: "2028-01-01",
        issuedAt: "2026-01-01",
        licenseNumber: "ABC-123",
        licenseType: "LCSW",
        practitioner: "payload-user-1",
        state: "CA",
        status: "active",
      },
      overrideAccess: true,
    })
  })
})
