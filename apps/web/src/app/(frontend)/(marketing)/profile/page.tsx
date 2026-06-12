import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "~/features/auth/auth.server"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

export default async function ProfilePage(): Promise<never> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in?callbackUrl=/profile")
  }

  const payloadUser = await getPayloadUserByBetterAuthId(session.user.id)
  if (!payloadUser?.slug) {
    redirect("/onboarding")
  }

  redirect(`/${payloadUser.slug}/settings/account`)
}
