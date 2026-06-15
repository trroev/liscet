import type { RenewalNotificationType } from "@repo/utils/renewalThreshold"

// Urgency copy keyed by reminder window. The actual day count is rendered
// separately from `daysRemaining`, so a catch-up send (e.g. the 90-day window
// firing at 88 days) reads correctly without hardcoding a number here.
const RENEWAL_TONE = {
  "renewal-1d": "Your license renews tomorrow — act now to avoid a lapse.",
  "renewal-7d":
    "Renewal is one week away. Please complete any outstanding requirements as soon as you can.",
  "renewal-30d":
    "Renewal is about a month away. Now is a good time to confirm your remaining requirements are complete.",
  "renewal-60d":
    "Renewal is roughly two months away — a good moment to check that you're on track with your required hours.",
  "renewal-90d":
    "This is an early reminder, so you have time to plan the rest of your continuing-education hours.",
} as const satisfies Record<RenewalNotificationType, string>

const pluralizeDays = (days: number): string =>
  days === 1 ? "1 day" : `${days} days`

const renewalSubject = (daysRemaining: number): string =>
  `Your license expires in ${pluralizeDays(daysRemaining)}`

export { pluralizeDays, RENEWAL_TONE, renewalSubject }
