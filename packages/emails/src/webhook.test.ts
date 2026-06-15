import { beforeEach, describe, expect, it, vi } from "vitest"

const verify = vi.fn()

vi.mock("svix", () => ({
  Webhook: vi.fn(() => ({ verify })),
}))

const { isSuppressionEvent, verifyResendWebhook } = await import("./webhook")

const headers = {
  "svix-id": "msg_1",
  "svix-signature": "v1,sig",
  "svix-timestamp": "1700000000",
}

describe("verifyResendWebhook", () => {
  beforeEach(() => {
    verify.mockReset()
  })

  it("returns the validated event for a well-formed payload", () => {
    verify.mockReturnValueOnce({
      created_at: "2026-01-01T00:00:00.000Z",
      data: { email_id: "email-1", to: ["user@example.com"] },
      type: "email.bounced",
    })

    const event = verifyResendWebhook({
      headers,
      payload: "{}",
      secret: "whsec_test",
    })

    expect(event.type).toBe("email.bounced")
    expect(event.data.email_id).toBe("email-1")
  })

  it("throws when the signature is invalid", () => {
    verify.mockImplementationOnce(() => {
      throw new Error("invalid signature")
    })

    expect(() =>
      verifyResendWebhook({ headers, payload: "{}", secret: "whsec_test" })
    ).toThrow()
  })

  it("throws when the verified payload has an unexpected shape", () => {
    verify.mockReturnValueOnce({ unexpected: true })

    expect(() =>
      verifyResendWebhook({ headers, payload: "{}", secret: "whsec_test" })
    ).toThrow()
  })
})

describe("isSuppressionEvent", () => {
  it("flags hard bounces and complaints", () => {
    expect(
      isSuppressionEvent({ created_at: "x", data: {}, type: "email.bounced" })
    ).toBe(true)
    expect(
      isSuppressionEvent({
        created_at: "x",
        data: {},
        type: "email.complained",
      })
    ).toBe(true)
  })

  it("ignores delivery and engagement events", () => {
    expect(
      isSuppressionEvent({ created_at: "x", data: {}, type: "email.delivered" })
    ).toBe(false)
  })
})
