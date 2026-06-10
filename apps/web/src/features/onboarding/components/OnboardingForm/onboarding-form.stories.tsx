import { preview } from "@repo/storybook-config/preview"
import type {
  CheckSlugAvailabilityResult,
  CompleteOnboardingResult,
} from "../../lib/types"
import { OnboardingFormView } from "./onboarding-form.view"

const submitNoOp = (): Promise<CompleteOnboardingResult> =>
  Promise.resolve({
    data: { userSlug: "trevor-mathiak" },
    status: "success",
  })

const navigateNoOp = (): void => {
  // Storybook stand-in for `router.push`; intentionally silent.
}

const availableSlug = (): Promise<CheckSlugAvailabilityResult> =>
  Promise.resolve({ data: { available: true }, status: "success" })

const takenSlug =
  (suggestion: string) => (): Promise<CheckSlugAvailabilityResult> =>
    Promise.resolve({
      data: { available: false, reason: "taken", suggestion },
      status: "success",
    })

const reservedSlug =
  (suggestion: string) => (): Promise<CheckSlugAvailabilityResult> =>
    Promise.resolve({
      data: { available: false, reason: "reserved", suggestion },
      status: "success",
    })

const submitTakenSuggestion =
  (suggestion: string) => (): Promise<CompleteOnboardingResult> =>
    Promise.resolve({
      code: "SLUG_TAKEN",
      message: "That slug is taken.",
      status: "error",
      suggestion,
    })

const meta = preview.meta({
  args: {
    onCheckSlug: availableSlug,
    onNavigate: navigateNoOp,
    onSubmit: submitNoOp,
  },
  component: OnboardingFormView,
  parameters: { layout: "fullscreen" },
  title: "Features/Onboarding/OnboardingForm",
})

export const Empty = meta.story({})

export const SlugAvailable = meta.story({
  args: { onCheckSlug: availableSlug },
})

export const SlugTaken = meta.story({
  args: { onCheckSlug: takenSlug("trevor-mathiak-2") },
})

export const SlugReserved = meta.story({
  args: { onCheckSlug: reservedSlug("admin-2") },
})

export const SubmitConflictWithSuggestion = meta.story({
  args: {
    onCheckSlug: availableSlug,
    onSubmit: submitTakenSuggestion("trevor-mathiak-3"),
  },
})
