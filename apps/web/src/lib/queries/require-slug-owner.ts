import "server-only"

import type { User } from "@repo/payload/payload-types"
import { notFound, redirect } from "next/navigation"
import { getPayload } from "payload"
import config from "~/payload.config"
import { requireOnboardedViewer } from "./require-onboarded-viewer"

const slugBelongsToAnotherUser = async (slug: string): Promise<boolean> => {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return existing.totalDocs > 0
}

/**
 * Page-level guard for `/{userSlug}` screens. Requires an onboarded viewer
 * (via `requireOnboardedViewer`), then verifies the route's slug belongs to
 * them: another user's slug redirects to the viewer's own space, and an
 * unknown slug renders not-found.
 */
export const requireSlugOwner = async ({
  userSlug,
}: {
  userSlug: string
}): Promise<{ user: User; slug: string }> => {
  const { user, slug } = await requireOnboardedViewer()
  if (userSlug === slug) {
    return { slug, user }
  }
  if (await slugBelongsToAnotherUser(userSlug)) {
    redirect(`/${slug}`)
  }
  notFound()
}
