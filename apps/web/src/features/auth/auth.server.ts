import "server-only"
import config from "@payload-config"
import { createAuth } from "@repo/auth"
import { getPayload } from "payload"
import { match } from "ts-pattern"

export const auth = createAuth({
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
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
                  email: user.email,
                  name: user.name ?? "",
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
        },
      },
    },
  },
})
