import { env } from "@repo/env/auth"
import { env as databaseEnv } from "@repo/env/database"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { account, session, user, verification } from "./schema"

const schema = { account, session, user, verification }

const createDatabaseAdapter = (): BetterAuthOptions["database"] => {
  const db = drizzle({
    client: new Pool({ connectionString: databaseEnv.DATABASE_URL }),
    schema,
  })
  return drizzleAdapter(db, { provider: "pg", schema })
}

export function createAuth(
  extraOptions?: Readonly<Partial<BetterAuthOptions>>
) {
  return betterAuth({
    database: createDatabaseAdapter(),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    ...extraOptions,
  })
}

export const auth = createAuth()

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
