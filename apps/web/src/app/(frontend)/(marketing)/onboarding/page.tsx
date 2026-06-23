import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingForm } from "~/features/onboarding/components/OnboardingForm"
import { requireViewer } from "~/lib/queries/current-viewer"

export const metadata: Metadata = {
  title: "Set up your account",
  robots: { follow: false, index: false },
}

export default async function OnboardingPage() {
  const { user } = await requireViewer({ callbackUrl: "/onboarding" })
  if (user.slug) {
    redirect(`/${user.slug}`)
  }
  return <OnboardingForm initialSlug={user.displayName ?? ""} />
}
