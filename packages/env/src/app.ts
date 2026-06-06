import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import {
  baseEnvOptions,
  baseUrlSchema,
  nodeEnvSchema,
  resolveBaseUrl,
} from "./shared"

resolveBaseUrl()

const env = createEnv({
  ...baseEnvOptions,
  server: {
    BASE_URL: baseUrlSchema,
    REVALIDATION_SECRET: z.string(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },
  shared: {
    NODE_ENV: nodeEnvSchema,
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
  },
})

export { env }
