import { env } from "@repo/env/auth"
import { DB_DRIVERS, resolveDatabase } from "@repo/env/database"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { drizzle } from "drizzle-orm/node-postgres"
import { MongoClient } from "mongodb"
import { Pool } from "pg"
import { match } from "ts-pattern"
import { account, session, user, verification } from "./schema"

const schema = { account, session, user, verification }

const createDatabaseAdapter = (): BetterAuthOptions["database"] =>
  match(resolveDatabase())
    .with({ driver: DB_DRIVERS.postgres }, ({ url }) => {
      const db = drizzle({
        client: new Pool({ connectionString: url }),
        schema,
      })
      return drizzleAdapter(db, { provider: "pg", schema })
    })
    .with({ driver: DB_DRIVERS.mongodb }, ({ url }) =>
      mongodbAdapter(new MongoClient(url).db(), { transaction: false })
    )
    .exhaustive()

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
