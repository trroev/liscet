import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_ADDRESS: process.env.RESEND_FROM_ADDRESS,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  },
  server: {
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_ADDRESS: z.string().min(1),
    RESEND_WEBHOOK_SECRET: z.string().min(1),
  },
})

export { env }
