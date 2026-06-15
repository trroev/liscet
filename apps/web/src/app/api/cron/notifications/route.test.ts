import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  captureException,
  dispatchRenewalNotifications,
  error,
  getPayload,
  info,
} = vi.hoisted(() => ({
  captureException: vi.fn(),
  dispatchRenewalNotifications: vi.fn(),
  error: vi.fn(),
  getPayload: vi.fn(),
  info: vi.fn(),
}))

vi.mock("@repo/env/app", () => ({ env: { CRON_SECRET: "cron_test" } }))

vi.mock("payload", () => ({ getPayload }))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/notifications/dispatch", () => ({
  dispatchRenewalNotifications,
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    withError: () => ({ error }),
    withMetadata: () => ({ info }),
  }),
}))

import { GET } from "./route"

const requestWith = (authorization?: string): Request =>
  new Request("https://app.test/api/cron/notifications", {
    headers: authorization ? { authorization } : {},
    method: "GET",
  })

describe("GET /api/cron/notifications", () => {
  beforeEach(() => {
    captureException.mockReset()
    dispatchRenewalNotifications.mockReset()
    error.mockReset()
    getPayload.mockReset()
    info.mockReset()
  })

  it("rejects a request without the cron bearer token", async () => {
    const response = await GET(requestWith())

    expect(response.status).toBe(401)
    expect(dispatchRenewalNotifications).not.toHaveBeenCalled()
  })

  it("rejects a request with the wrong cron bearer token", async () => {
    const response = await GET(requestWith("Bearer nope"))

    expect(response.status).toBe(401)
    expect(dispatchRenewalNotifications).not.toHaveBeenCalled()
  })

  it("dispatches and returns the summary on a valid request", async () => {
    const summary = { failed: 0, scanned: 3, sent: 2, skipped: 1 }
    getPayload.mockResolvedValueOnce({ id: "payload" })
    dispatchRenewalNotifications.mockResolvedValueOnce(summary)

    const response = await GET(requestWith("Bearer cron_test"))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(summary)
    expect(dispatchRenewalNotifications).toHaveBeenCalledWith({
      now: expect.any(Date),
      payload: { id: "payload" },
    })
  })

  it("returns 500 and reports to Sentry when dispatch throws", async () => {
    getPayload.mockResolvedValueOnce({ id: "payload" })
    dispatchRenewalNotifications.mockRejectedValueOnce(new Error("boom"))

    const response = await GET(requestWith("Bearer cron_test"))

    expect(response.status).toBe(500)
    expect(captureException).toHaveBeenCalledOnce()
  })
})
