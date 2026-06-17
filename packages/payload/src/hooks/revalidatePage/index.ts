import { revalidatePath } from "next/cache"

type RevalidatePageArgs<TDoc> = {
  resolvePaths: (doc: TDoc) => Array<string>
}

/**
 * Builds an `afterChange` hook that revalidates one or more on-demand paths
 * derived from the changed doc. Shared by the `Homepage` global (revalidates
 * `/`) and the `Pages` collection (revalidates `/{slug}` and the sitemap). The
 * returned `({ doc }) => doc` function is structurally compatible with both
 * `GlobalAfterChangeHook` and `CollectionAfterChangeHook`.
 */
export const revalidatePage =
  <TDoc>({ resolvePaths }: RevalidatePageArgs<TDoc>) =>
  ({ doc }: { doc: TDoc }): TDoc => {
    for (const path of resolvePaths(doc)) {
      revalidatePath(path)
    }
    return doc
  }
