import "server-only"

import { notFound, redirect } from "next/navigation"
import { getPayload } from "payload"
import config from "~/payload.config"
import { type OnboardedViewer, requireViewer } from "./current-viewer"

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
 * (via `requireViewer({ onboarded: true })`), then verifies the route's slug
 * belongs to them: another user's slug redirects to the viewer's own space, and
 * an unknown slug renders not-found.
 */
export const requireSlugOwner = async ({
  userSlug,
}: {
  userSlug: string
}): Promise<OnboardedViewer> => {
  const current = await requireViewer({ onboarded: true })
  if (userSlug === current.slug) {
    return current
  }
  if (await slugBelongsToAnotherUser(userSlug)) {
    redirect(`/${current.slug}`)
  }
  notFound()
}
