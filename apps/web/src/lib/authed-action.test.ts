import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

const viewer = vi.fn()
const getPayload = vi.fn()
const captureException = vi.fn()
const scopeSentry = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload }))
vi.mock("~/lib/queries/current-viewer", () => ({ viewer }))
vi.mock("@sentry/nextjs", () => ({ captureException }))
vi.mock("@repo/observability", () => ({ scopeSentry }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))

const { authedAction } = await import("./authed-action")

const payload = { find: vi.fn() }

beforeEach(() => {
  vi.clearAllMocks()
  getPayload.mockResolvedValue(payload)
})

const stubUser = (id = "user-1"): void => {
  viewer.mockResolvedValueOnce({ session: { id }, user: { id } })
}

describe("authedAction", () => {
  it("invokes the handler with user, payload, and validated input on success", async () => {
    stubUser("user-7")
    const handler = vi.fn(async () => ({ status: "success", data: 1 }))
    const action = authedAction(z.object({ n: z.number() }), handler)

    const result = await action({ n: 5 })

    expect(result).toEqual({ status: "success", data: 1 })
    expect(handler).toHaveBeenCalledWith({
      input: { n: 5 },
      payload,
      user: { id: "user-7" },
    })
    expect(scopeSentry).toHaveBeenCalledWith({ practitionerId: "user-7" })
  })

  it("returns UNAUTHENTICATED without invoking the handler when no user", async () => {
    viewer.mockResolvedValueOnce(null)
    const handler = vi.fn()
    const action = authedAction(handler)

    const result = await action(undefined)

    expect(result).toEqual({
      code: "UNAUTHENTICATED",
      message: "You must be signed in.",
      status: "error",
    })
    expect(handler).not.toHaveBeenCalled()
    expect(getPayload).not.toHaveBeenCalled()
    expect(scopeSentry).not.toHaveBeenCalled()
  })

  it("treats a session without a Payload user as unauthenticated for product actions", async () => {
    viewer.mockResolvedValueOnce({ session: { id: "ba-1" }, user: null })
    const handler = vi.fn()
    const action = authedAction(handler)

    const result = await action(undefined)

    expect(result).toMatchObject({ code: "UNAUTHENTICATED", status: "error" })
    expect(handler).not.toHaveBeenCalled()
  })

  it("returns INVALID_INPUT without invoking the handler when validation fails", async () => {
    stubUser()
    const handler = vi.fn()
    const action = authedAction(z.object({ n: z.number() }), handler)

    const result = await action({ n: "nope" } as never)

    expect(result).toMatchObject({ code: "INVALID_INPUT", status: "error" })
    expect(handler).not.toHaveBeenCalled()
  })

  it("passes raw input through untouched in the schema-less variant", async () => {
    stubUser()
    const handler = vi.fn(async () => ({
      data: undefined,
      status: "success" as const,
    }))
    const action = authedAction<string, { status: "success"; data: undefined }>(
      handler
    )

    await action("raw-value")

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ input: "raw-value" })
    )
  })

  it("captures a thrown error and returns INTERNAL_ERROR", async () => {
    stubUser()
    const action = authedAction(() => Promise.reject(new Error("boom")))

    const result = await action(undefined)

    expect(result).toEqual({
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      status: "error",
    })
    expect(captureException).toHaveBeenCalledOnce()
  })
})
