import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  server: {
    BLOB_READ_WRITE_TOKEN: z.string(),
  },
})

export { env }
