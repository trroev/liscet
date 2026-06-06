import { randomBytes } from "node:crypto"

const DEFAULT_BASE_URL = "http://localhost:3000"

/**
 * Environment-variable names the harness uses to carry per-run state from
 * config evaluation through `globalSetup` and into `globalTeardown`. Centralised
 * so the setup and teardown sides cannot drift apart.
 */
const TEST_ENV_KEYS = {
  dbName: "E2E_RUN_DB_NAME",
  dbUri: "E2E_DB_URI",
  adminUri: "E2E_PG_ADMIN_URI",
  baseUrl: "E2E_BASE_URL",
} as const satisfies Record<string, string>

type TestEnv = {
  readonly dbName: string
  readonly dbUri: string
  readonly adminUri: string
  readonly baseUrl: string
}

/**
 * `isInitialRun` is true only for the evaluation that first set up the per-run
 * database — i.e. the run-initializing process. Playwright re-imports this
 * config in each worker/retry process (which inherit the `E2E_*` env vars), so
 * provisioning must run only when this is true to avoid re-creating the db.
 */
type InitTestEnv = TestEnv & { readonly isInitialRun: boolean }

const buildTestDbName = (): string => {
  const suffix = randomBytes(4).toString("hex")
  return `e2e_test_${Date.now()}_${suffix}`
}

const buildDbUri = ({
  baseUri,
  dbName,
}: {
  readonly baseUri: string
  readonly dbName: string
}): string => {
  const url = new URL(baseUri)
  url.pathname = `/${dbName}`
  return url.toString()
}

/**
 * Postgres can't create or drop the database a connection is currently using,
 * so CREATE/DROP DATABASE run against a separate maintenance database. Defaults
 * to `/postgres` (present on standard installs, including the CI service
 * container); override with `E2E_PG_ADMIN_URL` for managed setups (e.g. Neon)
 * where `/postgres` isn't reachable or the role lacks createdb there.
 */
const buildAdminUri = ({ baseUri }: { readonly baseUri: string }): string => {
  const override = process.env.E2E_PG_ADMIN_URL
  if (override) {
    return override
  }
  const url = new URL(baseUri)
  url.pathname = "/postgres"
  return url.toString()
}

const markPayloadMigrating = (): void => {
  // The schema is provisioned by migrations, so any Payload connection in this
  // process (notably the `globalSetup` seed's `getPayload`) must skip the
  // Postgres adapter's dev-mode schema `push`: that sync only knows Payload's
  // tables and would drop the Better Auth (Drizzle) tables the migrations
  // created. `PAYLOAD_MIGRATING` is the adapter's signal for "migrations own
  // the schema".
  process.env.PAYLOAD_MIGRATING = "true"
}

/**
 * Resolve (and on first call, initialise) the per-run database.
 *
 * The active connection string is rewritten to a fresh per-run database BEFORE
 * `@repo/env/database` is first evaluated: that module captures its runtime env
 * eagerly on import, so the rewrite must precede any import that pulls it in.
 *
 * Idempotent: the first call performs the rewrite and persists per-run state in
 * `process.env`; later same-process calls (e.g. from `globalSetup`) read it back.
 */
export const getOrInitTestEnv = (): InitTestEnv => {
  const existingDbName = process.env[TEST_ENV_KEYS.dbName]
  const existingUri = process.env[TEST_ENV_KEYS.dbUri]
  const existingAdminUri = process.env[TEST_ENV_KEYS.adminUri]
  if (existingDbName && existingUri && existingAdminUri) {
    markPayloadMigrating()
    return {
      dbName: existingDbName,
      dbUri: existingUri,
      adminUri: existingAdminUri,
      baseUrl: process.env[TEST_ENV_KEYS.baseUrl] ?? DEFAULT_BASE_URL,
      isInitialRun: false,
    }
  }

  const rawUri = process.env.DATABASE_URL
  if (!rawUri) {
    throw new Error(
      "E2E suite requires DATABASE_URL pointing at a Postgres instance."
    )
  }
  const dbName = buildTestDbName()
  const dbUri = buildDbUri({ baseUri: rawUri, dbName })
  const adminUri = buildAdminUri({ baseUri: rawUri })
  process.env.DATABASE_URL = dbUri
  const baseUrl = process.env[TEST_ENV_KEYS.baseUrl] ?? DEFAULT_BASE_URL

  process.env[TEST_ENV_KEYS.dbName] = dbName
  process.env[TEST_ENV_KEYS.dbUri] = dbUri
  process.env[TEST_ENV_KEYS.adminUri] = adminUri
  process.env[TEST_ENV_KEYS.baseUrl] = baseUrl
  markPayloadMigrating()

  return { dbName, dbUri, adminUri, baseUrl, isInitialRun: true }
}

export type { InitTestEnv, TestEnv }
export { TEST_ENV_KEYS }
