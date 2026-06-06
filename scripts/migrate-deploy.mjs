#!/usr/bin/env node
//
// Apply pending Postgres migrations before a deploy serves traffic. Runs both
// Payload's migrations and Better Auth's Drizzle migrations. Invoked via
// `pnpm migrate`, which loads env through dotenvx; the Vercel build command
// calls it before the build so a production deploy migrates first.
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
  if (!process.env.DATABASE_URL) {
    process.stderr.write("DATABASE_URL is not set — cannot run migrations.\n")
    process.exit(1)
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
