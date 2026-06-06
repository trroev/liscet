import "server-only"

import { headers } from "next/headers"
import { getPayload } from "payload"
import { auth } from "~/features/auth/auth.server"
import type { Viewer } from "~/lib/policies/viewer"
import config from "~/payload.config"
import { getPayloadUserByBetterAuthId } from "./payload-user-by-better-auth-id"

/**
 * Resolves the current authenticated viewer from request headers.
 *
 * Checks the better-auth user session first, then falls back to the Payload
 * admin session. Returns `null` when no session is present.
 *
 * The user-first ordering matters when the same browser holds both a
 * `/admin` cookie and a public-app session: public-app policies
 * intentionally exclude admins, so the user identity must win when both
 * exist.
 *
 * Pass the returned value to any policy in `lib/policies` to make
 * authorization decisions.
 */
export const getCurrentViewer = async (): Promise<Viewer> => {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (session) {
    const user = await getPayloadUserByBetterAuthId(session.user.id)
    if (user) {
      return { kind: "user", user }
    }
  }
  const payload = await getPayload({ config })
  const { user: adminUser } = await payload.auth({ headers: requestHeaders })
  if (adminUser?.collection === "admins") {
    return { kind: "admin", admin: adminUser }
  }
  return null
}
