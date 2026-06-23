import "server-only"
import config from "@payload-config"
import { createAuth } from "@repo/auth"
import { captureException } from "@sentry/nextjs"
import { getPayload } from "payload"
import { match } from "ts-pattern"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

// Report sync failures to Sentry without blocking the BetterAuth operation.
const safe =
  <TArgs extends ReadonlyArray<unknown>>(
    fn: (...args: TArgs) => Promise<void>
  ) =>
  async (...args: TArgs): Promise<void> => {
    try {
      await fn(...args)
    } catch (cause) {
      captureException(cause)
    }
  }

export const auth = createAuth({
  trustedOrigins: ["https://liscet.localhost", "https://*.liscet.localhost"],
  databaseHooks: {
    user: {
      create: {
        after: safe(async (user) => {
          const payload = await getPayload({ config })
          const existing = await payload.find({
            collection: "users",
            where: { email: { equals: user.email } },
            limit: 1,
          })
          const [existingUser] = existing.docs
          await match(existingUser)
            .with(undefined, () =>
              payload.create({
                collection: "users",
                data: {
                  betterAuthId: user.id,
                  displayName: user.name ?? "",
                  email: user.email,
                },
              })
            )
            .otherwise((found) =>
              payload.update({
                collection: "users",
                id: found.id,
                data: { betterAuthId: user.id },
              })
            )
        }),
      },
      update: {
        // Keyed by betterAuthId — email is the field that may be changing.
        after: safe(async (user) => {
          const payload = await getPayload({ config })
          const existingUser = await getPayloadUserByBetterAuthId(user.id)
          await match(existingUser)
            .with(null, () =>
              payload.create({
                collection: "users",
                data: {
                  betterAuthId: user.id,
                  displayName: user.name ?? "",
                  email: user.email,
                },
              })
            )
            .otherwise((found) =>
              payload.update({
                collection: "users",
                id: found.id,
                data: { displayName: user.name ?? "", email: user.email },
              })
            )
        }),
      },
      delete: {
        after: safe(async (user) => {
          const payload = await getPayload({ config })
          const existingUser = await getPayloadUserByBetterAuthId(user.id)
          // The users beforeDelete hook cascades to Licenses + Courses.
          await match(existingUser)
            .with(null, () => Promise.resolve())
            .otherwise((found) =>
              payload.delete({ collection: "users", id: found.id })
            )
        }),
      },
    },
  },
})
