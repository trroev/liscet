import "server-only"

import type { User as SessionUser } from "@repo/auth"
import type { User } from "@repo/payload/payload-types"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { auth } from "~/features/auth/auth.server"
import { getPayloadUserByBetterAuthId } from "./payload-user-by-better-auth-id"

/**
 * The resolved viewer: the authenticated better-auth identity (`session`)
 * paired with its linked Payload `users` document (`user`).
 *
 * `user` is nullable because a valid session can briefly outrun its Payload
 * row (the sync hook threw and was swallowed to Sentry, or the user was
 * unsynced/soft-deleted). Public chrome treats that as signed-in-but-degraded;
 * authed surfaces (`requireViewer`) reject it.
 */
export type Viewer = {
  readonly session: SessionUser
  readonly user: User | null
}

/** A viewer guaranteed to have a linked Payload user. */
export type AuthedViewer = {
  readonly session: SessionUser
  readonly user: User
}

/** An `AuthedViewer` that has finished onboarding, so `slug` is set. */
export type OnboardedViewer = AuthedViewer & { readonly slug: string }

/**
 * Resolves the current viewer from request headers: the better-auth session
 * and its linked Payload user. Returns `null` when no session is present.
 *
 * This is the single seam every authed surface crosses — layout, public
 * chrome, pages, and actions. Request-scoped via `cache`, so repeated calls
 * within one render resolve the session and lookup once.
 */
export const viewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return null
  }
  const user = await getPayloadUserByBetterAuthId(session.user.id)
  return { session: session.user, user }
})

type RequireViewerOptions = {
  readonly onboarded?: boolean
  readonly callbackUrl?: string
}

/**
 * Gate for authed surfaces. Redirects to `/sign-in` (optionally with a
 * `callbackUrl`) when there is no session or no linked Payload user. With
 * `onboarded: true` it additionally redirects unfinished practitioners to
 * `/onboarding`, so callers can rely on `slug` being set.
 */
export function requireViewer(options: {
  readonly onboarded: true
  readonly callbackUrl?: string
}): Promise<OnboardedViewer>
export function requireViewer(options?: {
  readonly onboarded?: false
  readonly callbackUrl?: string
}): Promise<AuthedViewer>
export async function requireViewer({
  onboarded = false,
  callbackUrl,
}: RequireViewerOptions = {}): Promise<AuthedViewer | OnboardedViewer> {
  const current = await viewer()
  if (!current?.user) {
    redirect(callbackUrl ? `/sign-in?callbackUrl=${callbackUrl}` : "/sign-in")
  }
  if (!onboarded) {
    return { session: current.session, user: current.user }
  }
  const { slug } = current.user
  if (!slug) {
    redirect("/onboarding")
  }
  return { session: current.session, slug, user: current.user }
}
