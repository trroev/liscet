import { createEnv } from "@t3-oss/env-nextjs"
import { baseEnvOptions, baseUrlSchema, resolveBaseUrl } from "./shared"

resolveBaseUrl()

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {},
  server: {
    BASE_URL: baseUrlSchema.optional(),
  },
})

export { env }
