#!/usr/bin/env node
//
// Apply pending database migrations before a deploy serves traffic.
//
// The active backend is implied by the environment: MongoDB (MONGODB_URI) is
// schemaless and needs no migrations, so this is a no-op unless DATABASE_URL
// (Postgres) is set. When it is, both Payload's migrations and Better Auth's
// Drizzle migrations are applied. Run via `pnpm migrate`, which loads env
// through dotenvx; the Vercel build command invokes it before the build so a
// production deploy migrates first.
//
// Preview deploys run the build command too — point them at a separate database
// (e.g. a Neon branch) so a preview build never migrates the production schema.

import { spawnSync } from "node:child_process"

const run = ({ label, args }) => {
  process.stdout.write(`\n>> ${label}\n`)
  const result = spawnSync("pnpm", args, { stdio: "inherit" })
  if (result.status !== 0) {
    process.stderr.write(`${label} failed (exit ${result.status ?? 1}).\n`)
    process.exit(result.status ?? 1)
  }
}

const main = () => {
  const hasPostgres = Boolean(process.env.DATABASE_URL)
  const hasMongo = Boolean(process.env.MONGODB_URI)

  if (hasPostgres && hasMongo) {
    process.stderr.write(
      "Both DATABASE_URL and MONGODB_URI are set — cannot determine the migration target. Set exactly one.\n"
    )
    process.exit(1)
  }

  if (!hasPostgres) {
    process.stdout.write(
      "No DATABASE_URL set — the MongoDB backend is schemaless and needs no migrations. Skipping.\n"
    )
    return
  }

  run({
    label: "Payload migrations",
    args: ["--filter", "web", "exec", "payload", "migrate"],
  })
  run({
    label: "Better Auth (Drizzle) migrations",
    args: ["--filter", "@repo/auth", "exec", "drizzle-kit", "migrate"],
  })

  process.stdout.write("\nMigrations applied.\n")
}

main()
