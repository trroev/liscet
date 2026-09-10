import "server-only"
import { createAuth } from "@repo/auth"
import { captureException } from "@sentry/nextjs"
import { getPayload } from "payload"
import { match } from "ts-pattern"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"
import config from "~/payload.config"
import {
  buildPractitionerSyncData,
  type PractitionerSyncSource,
} from "./lib/build-practitioner-sync-data"

type LinkableUser = Readonly<PractitionerSyncSource & { id: string }>

/**
 * The full record for creating or linking a practitioner: the better-auth
 * identity plus the synced profile. The update path writes the profile alone,
 * since `betterAuthId` is the key it was looked up by.
 */
const toLinkedPractitioner = ({ user }: { user: LinkableUser }) => ({
  betterAuthId: user.id,
  ...buildPractitionerSyncData({ user }),
})

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
                data: toLinkedPractitioner({ user }),
              })
            )
            .otherwise((found) =>
              payload.update({
                collection: "users",
                id: found.id,
                data: toLinkedPractitioner({ user }),
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
                data: toLinkedPractitioner({ user }),
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
