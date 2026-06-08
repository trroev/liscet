import { env } from "@repo/env/email"
import { isValidElement, type ReactElement } from "react"
import { Resend } from "resend"
import { z } from "zod"

const resend = new Resend(env.RESEND_API_KEY)

const recipientSchema = z.union([
  z.string().email(),
  z.array(z.string().email()).nonempty(),
])

const sendEmailSchema = z.object({
  from: z.string().min(1),
  react: z.custom<ReactElement>(isValidElement, {
    message: "react must be a valid React element",
  }),
  replyTo: z.string().email().optional(),
  subject: z.string().min(1),
  to: recipientSchema,
})

type SendEmailInput = z.infer<typeof sendEmailSchema>

type SendEmailResult = Awaited<ReturnType<typeof resend.emails.send>>

const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const payload = sendEmailSchema.parse(input)

  return await resend.emails.send(payload)
}

export type { SendEmailInput, SendEmailResult }
export { resend, sendEmail }
