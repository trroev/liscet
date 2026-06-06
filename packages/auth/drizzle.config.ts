import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit config for the Better Auth Postgres backend.
 *
 * Only relevant when `DATABASE_URL` is set (the Postgres path). Run
 * `pnpm --filter @repo/auth db:push` in development to sync the schema, and
 * `db:migrate` in production. `db:generate` regenerates `src/schema.ts` from
 * Better Auth's options.
 */
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
