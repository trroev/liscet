import { TZDate } from "@date-fns/tz"
import { differenceInCalendarDays } from "date-fns"

type DaysUntilExpiryInput = {
  readonly expiresAt: Date | string
  readonly now: Date
  readonly timezone: string
}

const daysUntilExpiry = ({
  expiresAt,
  now,
  timezone,
}: DaysUntilExpiryInput): number => {
  const expiry = new TZDate(new Date(expiresAt).getTime(), timezone)
  const today = new TZDate(now.getTime(), timezone)

  return differenceInCalendarDays(expiry, today)
}

export type { DaysUntilExpiryInput }
export { daysUntilExpiry }
