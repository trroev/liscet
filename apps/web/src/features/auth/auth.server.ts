import "server-only"
import { createAuth } from "@repo/auth"
import { captureException } from "@sentry/nextjs"
import { getPayload } from "payload"
import { match } from "ts-pattern"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"
import config from "~/payload.config"
import { buildPractitionerSyncData } from "./lib/build-practitioner-sync-data"

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
                  ...buildPractitionerSyncData({ user }),
                },
              })
            )
            .otherwise((found) =>
              payload.update({
                collection: "users",
                id: found.id,
                data: {
                  betterAuthId: user.id,
                  ...buildPractitionerSyncData({ user }),
                },
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
                  ...buildPractitionerSyncData({ user }),
                },
              })
            )
            .otherwise((found) =>
              payload.update({
                collection: "users",
                id: found.id,
                data: buildPractitionerSyncData({ user }),
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
