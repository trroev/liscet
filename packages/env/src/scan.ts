import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    VIRUS_SCAN_API_KEY: process.env.VIRUS_SCAN_API_KEY,
    VIRUS_SCAN_URL: process.env.VIRUS_SCAN_URL,
  },
  server: {
    VIRUS_SCAN_API_KEY: z.string().optional(),
    VIRUS_SCAN_URL: z.url().optional(),
  },
})

export { env }
