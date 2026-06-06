import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  server: {
    DATABASE_URL: z.string(),
  },
})

export { env }
