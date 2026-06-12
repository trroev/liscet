import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "~/features/auth/auth.server"
import { SignOutButton } from "~/features/auth/components/SignOutButton"
import { AvatarManager } from "~/features/profile/components/AvatarManager"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in?callbackUrl=/profile")
  }

  const { user } = session
  const payloadUser = await getPayloadUserByBetterAuthId(user.id)

  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-heading-xl text-text-primary">
          Profile
        </h1>
        <p className="text-body text-text-secondary">
          Your account information.
        </p>
      </div>

      <div className="space-y-6">
        <AvatarManager
          avatarUrl={
            typeof payloadUser?.avatar === "object" && payloadUser.avatar
              ? (payloadUser.avatar.url ?? null)
              : null
          }
          email={user.email}
        />
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Email</dt>
            <dd className="text-body text-text-primary">{user.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Member since</dt>
            <dd className="text-body text-text-primary">
              {dateFormatter.format(new Date(user.createdAt))}
            </dd>
          </div>
        </dl>
        <SignOutButton />
      </div>
    </section>
  )
}
