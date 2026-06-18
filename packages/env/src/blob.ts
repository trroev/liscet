import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    BLOB_PRIVATE_READ_WRITE_TOKEN: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    BLOB_SIGNED_URL_TTL_SECONDS: process.env.BLOB_SIGNED_URL_TTL_SECONDS,
  },
  server: {
    BLOB_PRIVATE_READ_WRITE_TOKEN: z.string(),
    BLOB_READ_WRITE_TOKEN: z.string(),
    BLOB_SIGNED_URL_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(300),
  },
})

export { env }
