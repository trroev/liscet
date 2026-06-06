import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions, nodeEnvSchema } from "./shared"

const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const

const env = createEnv({
  ...baseEnvOptions,
  server: {
    LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
  },
  shared: {
    NODE_ENV: nodeEnvSchema.default("development"),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
})

const defaultLevel = env.NODE_ENV === "production" ? "info" : "debug"

const resolved = {
  ...env,
  LOG_LEVEL: env.LOG_LEVEL ?? defaultLevel,
} as const

export { resolved as env }
