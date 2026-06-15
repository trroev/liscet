const RENEWAL_THRESHOLDS = [90, 60, 30, 7, 1] as const

type RenewalThreshold = (typeof RENEWAL_THRESHOLDS)[number]

const NOTIFICATION_TYPE_BY_THRESHOLD = {
  1: "renewal-1d",
  7: "renewal-7d",
  30: "renewal-30d",
  60: "renewal-60d",
  90: "renewal-90d",
} as const satisfies Record<RenewalThreshold, string>

type RenewalNotificationType =
  (typeof NOTIFICATION_TYPE_BY_THRESHOLD)[RenewalThreshold]

// Nearest un-passed reminder window: the smallest threshold still at or above
// `daysRemaining`. On a healthy daily cron this equals exact-day matching; when
// a run is missed it self-heals to the current window and never re-sends a
// wider window once a tighter one is active. Returns null outside [1, 90].
const activeRenewalThreshold = (
  daysRemaining: number
): RenewalThreshold | null => {
  if (daysRemaining < 1) {
    return null
  }

  const candidates = RENEWAL_THRESHOLDS.filter(
    (threshold) => threshold >= daysRemaining
  )

  if (candidates.length === 0) {
    return null
  }

  return Math.min(...candidates) as RenewalThreshold
}

const renewalNotificationType = (
  threshold: RenewalThreshold
): RenewalNotificationType => NOTIFICATION_TYPE_BY_THRESHOLD[threshold]

export type { RenewalNotificationType, RenewalThreshold }
export {
  activeRenewalThreshold,
  NOTIFICATION_TYPE_BY_THRESHOLD,
  RENEWAL_THRESHOLDS,
  renewalNotificationType,
}
