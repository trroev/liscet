import { match, P } from "ts-pattern"
import { z } from "zod"

const TRAILING_SLASH = /\/$/

const NODE_ENVS = [
  "development",
  "production",
  "test",
] as const satisfies ReadonlyArray<string>

const nodeEnvSchema = z.enum(NODE_ENVS)

const baseUrlSchema = z.string().url()

const baseEnvOptions = {
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
} as const satisfies {
  emptyStringAsUndefined: boolean
  skipValidation: boolean
}

const resolveBaseUrl = (): void => {
  const resolved = match({
    base: process.env.BASE_URL,
    vercel: process.env.VERCEL_URL,
  })
    .with({ base: P.string.startsWith("http") }, ({ base }) => base)
    .with(
      { base: P.string },
      ({ base }) => `https://${base.replace(TRAILING_SLASH, "")}`
    )
    .with(
      { base: P.nullish, vercel: P.string },
      ({ vercel }) => `https://${vercel}`
    )
    .with({ base: P.nullish, vercel: P.nullish }, () => undefined)
    .exhaustive()

  if (resolved !== undefined) {
    process.env.BASE_URL = resolved
  }
}

export { baseEnvOptions, baseUrlSchema, nodeEnvSchema, resolveBaseUrl }
