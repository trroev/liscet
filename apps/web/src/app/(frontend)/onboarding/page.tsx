import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingForm } from "~/features/onboarding/components/OnboardingForm"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

export const metadata: Metadata = {
  title: "Set up your account",
  robots: { follow: false, index: false },
}

export default async function OnboardingPage() {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    redirect("/sign-in?callbackUrl=/onboarding")
  }
  if (viewer.user.slug) {
    redirect(`/${viewer.user.slug}`)
  }
  return <OnboardingForm initialSlug={viewer.user.displayName ?? ""} />
}
