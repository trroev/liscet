import type { CollectionBeforeChangeHook } from "payload"
import { match, P } from "ts-pattern"

export const stampPublishedAt: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) =>
  match({
    existingPublishedAt: originalDoc?.publishedAt,
    status: data._status,
  })
    .with({ existingPublishedAt: P.nullish, status: "published" }, () => ({
      ...data,
      publishedAt: new Date().toISOString(),
    }))
    .otherwise(() => data)
