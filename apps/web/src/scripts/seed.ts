import config from "@payload-config"
import { createAuth } from "@repo/auth"
import { seed } from "@repo/db-seed/seed"
import { createLogger } from "@repo/logger"
import { getPayload } from "payload"

if (process.env.NODE_ENV === "production") {
  throw new Error(
    "db-seed must not run in production — refusing to execute against a production database."
  )
}

const log = createLogger({ name: "scripts.seed" })

// Build a CLI-local BetterAuth instance with the create-hook that mirrors the
// identity into the Payload `users` collection. apps/web/src/features/auth/
// auth.server.ts can't be reused here because it imports @sentry/nextjs, which
// only resolves inside the Next.js runtime — not under a `payload run` script.
const auth = createAuth({
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const payload = await getPayload({ config })
          const existing = await payload.find({
            collection: "users",
            where: { email: { equals: user.email } },
            limit: 1,
            overrideAccess: true,
          })
          const [existingUser] = existing.docs
          if (existingUser === undefined) {
            await payload.create({
              collection: "users",
              data: {
                betterAuthId: user.id,
                displayName: user.name ?? "",
                email: user.email,
              },
              overrideAccess: true,
            })
            return
          }
          await payload.update({
            collection: "users",
            id: existingUser.id,
            data: { betterAuthId: user.id },
            overrideAccess: true,
          })
        },
      },
    },
  },
})

async function run(): Promise<void> {
  const payload = await getPayload({ config })
  const summary = await seed({ payload, auth })
  log.withMetadata(summary).info("seed complete")
}

try {
  await run()
} catch (err) {
  log.withError(err).error("seed failed")
  process.exit(1)
}
