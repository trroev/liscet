import "server-only"

import { createLogger } from "@repo/logger"
import type { User } from "@repo/payload/payload-types"
import type { HeaderAuth, SignedInAuth } from "@repo/types/HeaderAuth"
import { headers } from "next/headers"
import { match, P } from "ts-pattern"
import { signOutAction } from "~/features/auth/actions/sign-out"
import { auth } from "~/features/auth/auth.server"
import { buildInitials } from "~/lib/build-initials"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

const log = createLogger({ name: "lib.header-auth" })

/**
 * Resolves the avatar URL from a Payload `users.avatar` relationship field,
 * which is a populated `Media` doc, an unpopulated id string, or null/undefined.
 */
const resolveAvatarUrl = (avatar: User["avatar"]): string | null =>
  match(avatar)
    .with(P.nullish, P.string, () => null)
    .otherwise((media) => media.url ?? null)

export type BuildSignedInAuthInput = {
  displayName: string
  avatar: User["avatar"]
}

/**
 * Builds the `SignedInAuth` chrome state from a display name and avatar field,
 * wiring the shared sign-out action. Callers supply the display name because
 * its canonical source differs (better-auth session vs Payload user).
 */
export const buildSignedInAuth = ({
  displayName,
  avatar,
}: BuildSignedInAuthInput): SignedInAuth => ({
  status: "signed-in",
  displayName,
  initials: buildInitials(displayName),
  avatarUrl: resolveAvatarUrl(avatar),
  onSignOut: async () => {
    "use server"
    await signOutAction()
  },
})

/**
 * Resolves `HeaderAuth` for the public chrome (marketing and legal shells):
 * anonymous when no session exists, otherwise signed-in using the session's
 * display name and the Payload user's avatar.
 *
 * Contract for "session present, Payload user null": the viewer is treated as
 * `signed-in`. A valid better-auth session *is* an authenticated identity; the
 * Payload user only supplies the avatar, which degrades to initials when
 * absent. The sync hook (`auth.server.ts`) is awaited inside the sign-up flow,
 * so a missing Payload user is an invariant violation (the hook threw and was
 * swallowed to Sentry, or the user was unsynced/soft-deleted) rather than a
 * routine timing window — we surface it as a warning instead of silently
 * downgrading the chrome to `anonymous` and lying about authentication state.
 */
export const resolveHeaderAuth = async (): Promise<HeaderAuth> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "anonymous" }
  }
  const payloadUser = await getPayloadUserByBetterAuthId(session.user.id)
  return match(payloadUser)
    .with(P.nullish, () => {
      log
        .withMetadata({ betterAuthId: session.user.id })
        .warn(
          "better-auth session has no matching Payload user; rendering signed-in with a degraded avatar"
        )
      return buildSignedInAuth({
        displayName: session.user.name ?? session.user.email,
        avatar: null,
      })
    })
    .otherwise((user) =>
      buildSignedInAuth({
        displayName: session.user.name ?? session.user.email,
        avatar: user.avatar,
      })
    )
}
