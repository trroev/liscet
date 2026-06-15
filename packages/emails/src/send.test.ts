import { createElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const send = vi.fn()

vi.mock("@repo/env/email", () => ({
  env: {
    RESEND_API_KEY: "re_test",
    RESEND_FROM_ADDRESS: "Liscet <noreply@liscet.test>",
    RESEND_WEBHOOK_SECRET: "whsec_test",
  },
}))

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send } })),
}))

const { sendEmail } = await import("./send")

describe("sendEmail", () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ data: { id: "email-1" }, error: null })
  })

  it("defaults from to RESEND_FROM_ADDRESS when omitted", async () => {
    await sendEmail({
      react: createElement("div"),
      subject: "Hi",
      to: "user@example.com",
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Liscet <noreply@liscet.test>",
        subject: "Hi",
        to: "user@example.com",
      })
    )
  })

  it("uses an explicit from override", async () => {
    await sendEmail({
      from: "alerts@example.com",
      react: createElement("div"),
      subject: "Hi",
      to: "user@example.com",
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "alerts@example.com" })
    )
  })

  it("rejects an invalid recipient address", async () => {
    await expect(
      sendEmail({
        react: createElement("div"),
        subject: "Hi",
        to: "not-an-email",
      })
    ).rejects.toThrow()
    expect(send).not.toHaveBeenCalled()
  })

  it("rejects a payload whose react field is not an element", async () => {
    await expect(
      sendEmail({
        react: "nope" as never,
        subject: "Hi",
        to: "user@example.com",
      })
    ).rejects.toThrow()
    expect(send).not.toHaveBeenCalled()
  })
})
