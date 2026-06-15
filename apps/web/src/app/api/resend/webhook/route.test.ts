import { beforeEach, describe, expect, it, vi } from "vitest"

const { captureException, isSuppressionEvent, verifyResendWebhook, warn } =
  vi.hoisted(() => ({
    captureException: vi.fn(),
    isSuppressionEvent: vi.fn(),
    verifyResendWebhook: vi.fn(),
    warn: vi.fn(),
  }))

vi.mock("@repo/emails/webhook", () => ({
  isSuppressionEvent,
  verifyResendWebhook,
}))

vi.mock("@repo/env/email", () => ({
  env: { RESEND_WEBHOOK_SECRET: "whsec_test" },
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    withError: () => ({ warn }),
    withMetadata: () => ({ warn }),
  }),
}))

import { POST } from "./route"

const requestWith = (): Request =>
  new Request("https://app.test/api/resend/webhook", {
    body: "{}",
    headers: { "svix-id": "msg_1" },
    method: "POST",
  })

describe("POST /api/resend/webhook", () => {
  beforeEach(() => {
    captureException.mockReset()
    isSuppressionEvent.mockReset()
    verifyResendWebhook.mockReset()
    warn.mockReset()
  })

  it("acknowledges and logs a suppression event", async () => {
    verifyResendWebhook.mockReturnValueOnce({
      data: { email_id: "email-1", to: ["user@example.com"] },
      type: "email.bounced",
    })
    isSuppressionEvent.mockReturnValueOnce(true)

    const response = await POST(requestWith())

    expect(response.status).toBe(204)
    expect(warn).toHaveBeenCalledOnce()
    expect(captureException).not.toHaveBeenCalled()
  })

  it("acknowledges non-suppression events without logging", async () => {
    verifyResendWebhook.mockReturnValueOnce({
      data: {},
      type: "email.delivered",
    })
    isSuppressionEvent.mockReturnValueOnce(false)

    const response = await POST(requestWith())

    expect(response.status).toBe(204)
    expect(warn).not.toHaveBeenCalled()
  })

  it("rejects an unverified request with 401", async () => {
    verifyResendWebhook.mockImplementationOnce(() => {
      throw new Error("invalid signature")
    })

    const response = await POST(requestWith())

    expect(response.status).toBe(401)
    expect(captureException).toHaveBeenCalledOnce()
  })
})
