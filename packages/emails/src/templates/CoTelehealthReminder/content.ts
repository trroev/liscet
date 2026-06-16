import type { CoTelehealthNotificationType } from "@repo/utils/coTelehealthThreshold"

const CO_TELEHEALTH_TONE = {
  "co-telehealth-1d":
    "Your Colorado telehealth registration lapses tomorrow — renew it now to keep treating clients located in Colorado.",
  "co-telehealth-7d":
    "Your Colorado telehealth registration expires in one week. Please renew it soon to avoid an interruption.",
  "co-telehealth-30d":
    "Your Colorado telehealth registration is about a month from expiring. Now is a good time to start the renewal.",
  "co-telehealth-60d":
    "Your Colorado telehealth registration is roughly two months from expiring — a good moment to plan its renewal.",
  "co-telehealth-90d":
    "This is an early reminder that your Colorado telehealth registration will expire in about three months.",
} as const satisfies Record<CoTelehealthNotificationType, string>

const pluralizeDays = (days: number): string =>
  days === 1 ? "1 day" : `${days} days`

const coTelehealthSubject = (daysRemaining: number): string =>
  `Your Colorado telehealth registration expires in ${pluralizeDays(daysRemaining)}`

export { CO_TELEHEALTH_TONE, coTelehealthSubject, pluralizeDays }
