import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Client } from "pg"
import type { TestEnv } from "./test-env"

const dirname = path.dirname(fileURLToPath(import.meta.url))
// apps/e2e/src/fixtures -> repo root
const repoRoot = path.resolve(dirname, "../../../..")

const createPostgresDatabase = async ({
  adminUri,
  dbName,
}: {
  readonly adminUri: string
  readonly dbName: string
}): Promise<void> => {
  const client = new Client({ connectionString: adminUri })
  await client.connect()
  try {
    // The database name is a SQL identifier, so it can't be a bound parameter;
    // it's harness-generated (no user input), so interpolation is safe here.
    await client.query(`CREATE DATABASE "${dbName}"`)
  } catch (error) {
    // 42P04 = duplicate_database: a re-evaluated provision already created it.
    // The name is unique per run, so tolerating this is safe.
    const code =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined
    if (code !== "42P04") {
      throw error
    }
  } finally {
    await client.end()
  }
}

/**
 * Apply Payload + Better Auth (Drizzle) migrations to the per-run database by
 * reusing the production migration orchestrator rather than re-implementing it.
 * Running the real workflow means the e2e suite also validates that migrations
 * cleanly build a fresh Postgres schema.
 */
const runPostgresMigrations = ({ dbUri }: { readonly dbUri: string }): void => {
  const script = path.resolve(repoRoot, "scripts", "migrate-deploy.mjs")
  // Ensure the orchestrator sees Postgres, not a stale Mongo URI from the shell.
  const env = { ...process.env, DATABASE_URL: dbUri }
  Reflect.deleteProperty(env, "MONGODB_URI")
  const result = spawnSync("node", [script], {
    stdio: "inherit",
    env,
    cwd: repoRoot,
  })
  if (result.status !== 0) {
    throw new Error(
      `Postgres migrations failed (exit ${result.status ?? 1}). See output above.`
    )
  }
}

/**
 * Provision the per-run database before the web server boots. MongoDB is
 * schemaless and auto-creates on first write, so only Postgres needs explicit
 * creation + migration here.
 */
export const provisionTestDatabase = async ({
  driver,
  dbName,
  dbUri,
  adminUri,
}: TestEnv): Promise<void> => {
  // Imported dynamically (not statically) so `@repo/env/database` is first
  // evaluated only after the per-run rewrite in `getOrInitTestEnv`; see the note
  // there. By the time this runs, the module is already cached with per-run env.
  const { DB_DRIVERS } = await import("@repo/env/database")
  if (driver !== DB_DRIVERS.postgres) {
    return
  }
  if (!adminUri) {
    throw new Error(
      "Postgres provisioning requires a maintenance connection URI (E2E_PG_ADMIN_URI)."
    )
  }
  await createPostgresDatabase({ adminUri, dbName })
  runPostgresMigrations({ dbUri })
}
