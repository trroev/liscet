import { Webhook } from "svix"
import { z } from "zod"

const RESEND_WEBHOOK_EVENT_TYPES = [
  "email.bounced",
  "email.clicked",
  "email.complained",
  "email.delivered",
  "email.delivery_delayed",
  "email.opened",
  "email.sent",
] as const satisfies ReadonlyArray<string>

const SUPPRESSION_EVENT_TYPES = [
  "email.bounced",
  "email.complained",
] as const satisfies ReadonlyArray<(typeof RESEND_WEBHOOK_EVENT_TYPES)[number]>

const resendWebhookEventSchema = z.object({
  created_at: z.string(),
  data: z.object({
    email_id: z.string().optional(),
    to: z.array(z.string()).optional(),
  }),
  type: z.string(),
})

type ResendWebhookEvent = z.infer<typeof resendWebhookEventSchema>

type SuppressionEventType = (typeof SUPPRESSION_EVENT_TYPES)[number]

const isSuppressionEvent = (
  event: ResendWebhookEvent
): event is ResendWebhookEvent & { type: SuppressionEventType } =>
  (SUPPRESSION_EVENT_TYPES as ReadonlyArray<string>).includes(event.type)

/**
 * Verifies a Resend webhook request using its Svix signature headers and
 * returns the validated event payload. Throws when the signature is invalid or
 * the payload does not match the expected shape — callers should treat a throw
 * as a 401.
 */
const verifyResendWebhook = ({
  headers,
  payload,
  secret,
}: {
  headers: Record<string, string>
  payload: string
  secret: string
}): ResendWebhookEvent => {
  const webhook = new Webhook(secret)
  const verified = webhook.verify(payload, headers)

  return resendWebhookEventSchema.parse(verified)
}

export type { ResendWebhookEvent, SuppressionEventType }
export {
  isSuppressionEvent,
  RESEND_WEBHOOK_EVENT_TYPES,
  SUPPRESSION_EVENT_TYPES,
  verifyResendWebhook,
}
