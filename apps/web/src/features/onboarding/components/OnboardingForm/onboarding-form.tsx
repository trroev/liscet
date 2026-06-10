"use client"

import { useRouter } from "next/navigation"
import { checkSlugAvailability } from "../../actions/check-slug-availability"
import { completeOnboarding } from "../../actions/complete-onboarding"
import type {
  CheckSlugAvailabilityResult,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
} from "../../lib/types"
import { OnboardingFormView } from "./onboarding-form.view"

export type OnboardingFormProps = {
  onCheckSlug?: (slug: string) => Promise<CheckSlugAvailabilityResult>
  onSubmit?: (
    input: CompleteOnboardingInput
  ) => Promise<CompleteOnboardingResult>
}

export const OnboardingForm = ({
  onCheckSlug = checkSlugAvailability,
  onSubmit = completeOnboarding,
}: OnboardingFormProps): React.JSX.Element => {
  const router = useRouter()
  return (
    <OnboardingFormView
      onCheckSlug={onCheckSlug}
      onNavigate={(path) => {
        router.push(path)
        router.refresh()
      }}
      onSubmit={onSubmit}
    />
  )
}
