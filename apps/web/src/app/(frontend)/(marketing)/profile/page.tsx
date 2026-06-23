import { redirect } from "next/navigation"
import { requireViewer } from "~/lib/queries/current-viewer"

export default async function ProfilePage(): Promise<never> {
  const { slug } = await requireViewer({
    callbackUrl: "/profile",
    onboarded: true,
  })

  redirect(`/${slug}/settings/account`)
}
