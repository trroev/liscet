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
    CRON_SECRET: z.string().min(1),
    REVALIDATION_SECRET: z.string(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url().default("https://us.i.posthog.com"),
    NEXT_PUBLIC_TERMLY_TERMS_ID: z.string().optional(),
    NEXT_PUBLIC_TERMLY_PRIVACY_ID: z.string().optional(),
  },
  shared: {
    NODE_ENV: nodeEnvSchema,
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_TERMLY_TERMS_ID: process.env.NEXT_PUBLIC_TERMLY_TERMS_ID,
    NEXT_PUBLIC_TERMLY_PRIVACY_ID: process.env.NEXT_PUBLIC_TERMLY_PRIVACY_ID,
    NODE_ENV: process.env.NODE_ENV,
  },
})

export { env }
