import type { RenewalThreshold } from "../renewalThreshold"

const CO_TELEHEALTH_NOTIFICATION_TYPE_BY_THRESHOLD = {
  1: "co-telehealth-1d",
  7: "co-telehealth-7d",
  30: "co-telehealth-30d",
  60: "co-telehealth-60d",
  90: "co-telehealth-90d",
} as const satisfies Record<RenewalThreshold, string>

type CoTelehealthNotificationType =
  (typeof CO_TELEHEALTH_NOTIFICATION_TYPE_BY_THRESHOLD)[RenewalThreshold]

const coTelehealthNotificationType = (
  threshold: RenewalThreshold
): CoTelehealthNotificationType =>
  CO_TELEHEALTH_NOTIFICATION_TYPE_BY_THRESHOLD[threshold]

export type { CoTelehealthNotificationType }
export {
  CO_TELEHEALTH_NOTIFICATION_TYPE_BY_THRESHOLD,
  coTelehealthNotificationType,
}
