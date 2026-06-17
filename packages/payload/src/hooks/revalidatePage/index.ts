import { createLogger } from "@repo/logger"
import { revalidatePath } from "next/cache"

const log = createLogger({ name: "payload.revalidate-page" })

type RevalidatePageArgs<TDoc> = {
  resolvePaths: (doc: TDoc) => Array<string>
}

/**
 * Builds an `afterChange` hook that revalidates one or more on-demand paths
 * derived from the changed doc. Shared by the `Homepage` global (revalidates
 * `/`) and the `Pages` collection (revalidates `/{slug}` and the sitemap). The
 * returned `({ doc }) => doc` function is structurally compatible with both
 * `GlobalAfterChangeHook` and `CollectionAfterChangeHook`.
 *
 * Revalidation is fire-and-forget: `revalidatePath` throws when invoked outside
 * a request scope (e.g. the seed CLI), so failures are logged but never bubble
 * up to fail the underlying write.
 */
export const revalidatePage =
  <TDoc>({ resolvePaths }: RevalidatePageArgs<TDoc>) =>
  ({ doc }: { doc: TDoc }): TDoc => {
    for (const path of resolvePaths(doc)) {
      try {
        revalidatePath(path)
      } catch (error) {
        log
          .withError(error)
          .withMetadata({ path })
          .warn("path revalidation skipped")
      }
    }
    return doc
  }
