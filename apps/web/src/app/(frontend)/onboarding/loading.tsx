import { RiLoader4Line } from "@remixicon/react"

export default function OnboardingLoading() {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
    >
      <RiLoader4Line
        aria-hidden="true"
        className="size-10 animate-spin text-accent"
      />
      <span className="sr-only">Loading</span>
    </div>
  )
}
