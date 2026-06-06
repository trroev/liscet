import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  },
  server: {
    PAYLOAD_ADMIN_EMAIL: z.email().nullish(),
    PAYLOAD_ADMIN_PASSWORD: z.string().nullish(),
    PAYLOAD_ADMIN_PREFILL_ONLY: z.stringbool().default(false),
    PAYLOAD_SECRET: z.string(),
  },
})

export { env }
