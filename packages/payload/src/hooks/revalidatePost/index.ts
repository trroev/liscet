import { betterFetch } from "@better-fetch/fetch"
import { createLogger } from "@repo/logger"
import type { CollectionAfterChangeHook } from "payload"
import { match, P } from "ts-pattern"

const log = createLogger({ name: "payload.revalidate-post" })

export const revalidatePost: CollectionAfterChangeHook = async ({ doc }) => {
  await match({
    status: doc._status,
    baseUrl: process.env.BASE_URL,
    secret: process.env.REVALIDATION_SECRET,
  })
    .with(
      { status: "published", baseUrl: P.string, secret: P.string },
      async ({ baseUrl, secret }) => {
        const { error } = await betterFetch(`${baseUrl}/api/revalidate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${secret}` },
          body: { slug: doc.slug },
          retry: { type: "linear", attempts: 2, delay: 500 },
          timeout: 10_000,
          throw: false,
        })

        if (error) {
          log
            .withMetadata({
              url: `${baseUrl}/api/revalidate`,
              status: error.status,
              statusText: error.statusText,
            })
            .error("revalidation request failed")
        }
      }
    )
    .with({ status: "published" }, () => {
      log.warn(
        "BASE_URL or REVALIDATION_SECRET not configured — skipping revalidation"
      )
    })
    .otherwise(() => undefined)

  return doc
}
