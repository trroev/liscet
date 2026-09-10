import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions, resolveBaseUrl } from "./shared"

resolveBaseUrl()

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? process.env.BASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  server: {
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
})

export { env }
