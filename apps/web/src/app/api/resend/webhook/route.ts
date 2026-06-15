import { isSuppressionEvent, verifyResendWebhook } from "@repo/emails/webhook"
import { env } from "@repo/env/email"
import { createLogger } from "@repo/logger"
import { captureException } from "@sentry/nextjs"

const log = createLogger({ name: "api.resend.webhook" })

const svixHeaders = (request: Request): Record<string, string> => ({
  "svix-id": request.headers.get("svix-id") ?? "",
  "svix-signature": request.headers.get("svix-signature") ?? "",
  "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
})

export async function POST(request: Request): Promise<Response> {
  const payload = await request.text()

  try {
    const event = verifyResendWebhook({
      headers: svixHeaders(request),
      payload,
      secret: env.RESEND_WEBHOOK_SECRET,
    })

    if (isSuppressionEvent(event)) {
      log
        .withMetadata({
          emailId: event.data.email_id,
          recipients: event.data.to,
          type: event.type,
        })
        .warn(
          "Resend reported a hard bounce or complaint; recipient is suppressed by Resend"
        )
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    log.withError(error).warn("rejected unverified Resend webhook request")
    captureException(error)

    return new Response("Invalid webhook signature", { status: 401 })
  }
}
