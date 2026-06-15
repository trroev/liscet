import { env } from "@repo/env/email"
import { isValidElement, type ReactElement } from "react"
import { Resend } from "resend"
import { z } from "zod"

const resend = new Resend(env.RESEND_API_KEY)

const recipientSchema = z.union([z.email(), z.array(z.email()).nonempty()])

const sendEmailSchema = z.object({
  from: z.string().min(1).default(env.RESEND_FROM_ADDRESS),
  react: z.custom<ReactElement>(isValidElement, {
    message: "react must be a valid React element",
  }),
  replyTo: z.email().optional(),
  subject: z.string().min(1),
  to: recipientSchema,
})

type SendEmailInput = z.input<typeof sendEmailSchema>

type SendEmailResult = Awaited<ReturnType<typeof resend.emails.send>>

const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const payload = sendEmailSchema.parse(input)

  return await resend.emails.send(payload)
}

export type { SendEmailInput, SendEmailResult }
export { resend, sendEmail }
