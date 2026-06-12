import "server-only"

import type { User } from "@repo/payload/payload-types"
import { redirect } from "next/navigation"
import { getCurrentViewer } from "./current-viewer"

/**
 * Gate for authed product screens. Resolves the signed-in practitioner, or
 * redirects: unauthenticated viewers to sign-in, and signed-in practitioners
 * who have not finished onboarding (no slug yet) to `/onboarding`. Returns only
 * once a fully onboarded practitioner is present, so callers can rely on
 * `user.slug` being set.
 */
export const requireOnboardedViewer = async (): Promise<{
  user: User
  slug: string
}> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    redirect("/sign-in")
  }
  const { slug } = viewer.user
  if (!slug) {
    redirect("/onboarding")
  }
  return { slug, user: viewer.user }
}
