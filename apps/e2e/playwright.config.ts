import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"
import { provisionTestDatabase } from "./src/fixtures/provision-db"
import { getOrInitTestEnv } from "./src/fixtures/test-env"

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Resolve and provision the per-run database here, in config evaluation, so it
// completes before Playwright launches the web server (which boots in
// production mode with Postgres `push` off and therefore needs a migrated
// schema already in place). `getOrInitTestEnv` rewrites the connection string
// before `@repo/env/database` is first evaluated, so it (and `DB_DRIVERS`
// below) is imported dynamically rather than statically.
const testEnv = await getOrInitTestEnv()
// Only the run-initializing evaluation provisions; worker/retry processes
// re-import this config but inherit the per-run env and must not re-create it.
if (testEnv.isInitialRun) {
  await provisionTestDatabase(testEnv)
}

const { DB_DRIVERS } = await import("@repo/env/database")
const { driver, dbUri, baseUrl } = testEnv
// The schema is provisioned by migrations, so the Postgres adapter must not
// run its dev-mode schema `push` on connect: that sync only knows Payload's
// tables and would drop the Better Auth (Drizzle) tables the migrations
// created. `PAYLOAD_MIGRATING=true` is the adapter's explicit "migrations own
// the schema, skip push" signal — used here instead of `NODE_ENV=production`
// because `next start` runs under dotenvx's nextjs convention, which resets
// NODE_ENV to development before the adapter connects.
const webServerEnv: Record<string, string> =
  driver === DB_DRIVERS.postgres
    ? { DATABASE_URL: dbUri, PAYLOAD_MIGRATING: "true" }
    : { MONGODB_URI: dbUri }

const isCi = !!process.env.CI

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? [["github"], ["list"]] : "list",
  globalSetup: path.resolve(dirname, "global-setup.ts"),
  globalTeardown: path.resolve(dirname, "global-teardown.ts"),
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm start",
    cwd: path.resolve(dirname, "../web"),
    url: baseUrl,
    timeout: 240_000,
    reuseExistingServer: !isCi,
    env: webServerEnv,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
})
