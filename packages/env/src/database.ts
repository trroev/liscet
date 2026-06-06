import { createEnv } from "@t3-oss/env-nextjs"
import { match, P } from "ts-pattern"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
  },
  server: {
    DATABASE_URL: z.string().optional(),
    MONGODB_URI: z.string().optional(),
  },
})

const DB_DRIVERS = {
  mongodb: "mongodb",
  postgres: "postgres",
} as const satisfies Record<string, string>

type DbDriver = (typeof DB_DRIVERS)[keyof typeof DB_DRIVERS]

type DatabaseConfig =
  | { readonly driver: typeof DB_DRIVERS.mongodb; readonly url: string }
  | { readonly driver: typeof DB_DRIVERS.postgres; readonly url: string }

/**
 * Resolve the active database backend from environment.
 *
 * Exactly one of `DATABASE_URL` (Postgres) or `MONGODB_URI` (MongoDB) must be
 * set. Providing both — or neither — throws so the misconfiguration surfaces at
 * startup rather than silently picking a backend.
 */
const resolveDatabase = (): DatabaseConfig => {
  const { DATABASE_URL, MONGODB_URI } = env

  return match({ DATABASE_URL, MONGODB_URI })
    .with({ DATABASE_URL: P.string, MONGODB_URI: P.string }, () => {
      throw new Error(
        "Both DATABASE_URL and MONGODB_URI are set. Provide exactly one to select the database backend."
      )
    })
    .with(
      { DATABASE_URL: P.string, MONGODB_URI: P.nullish },
      ({ DATABASE_URL: url }) =>
        ({ driver: DB_DRIVERS.postgres, url }) satisfies DatabaseConfig
    )
    .with(
      { DATABASE_URL: P.nullish, MONGODB_URI: P.string },
      ({ MONGODB_URI: url }) =>
        ({ driver: DB_DRIVERS.mongodb, url }) satisfies DatabaseConfig
    )
    .with({ DATABASE_URL: P.nullish, MONGODB_URI: P.nullish }, () => {
      throw new Error(
        "No database configured. Set either DATABASE_URL (Postgres) or MONGODB_URI (MongoDB)."
      )
    })
    .exhaustive()
}

export type { DatabaseConfig, DbDriver }
export { DB_DRIVERS, env, resolveDatabase }
