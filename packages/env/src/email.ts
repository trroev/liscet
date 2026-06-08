import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  server: {
    RESEND_API_KEY: z.string(),
  },
})

export { env }
