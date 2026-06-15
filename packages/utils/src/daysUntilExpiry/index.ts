import { TZDate } from "@date-fns/tz"
import { differenceInCalendarDays } from "date-fns"

type DaysUntilExpiryInput = {
  readonly expiresAt: Date | string
  readonly now: Date
  readonly timezone: string
}

// Whole calendar days between `now` and `expiresAt`, both resolved in the given
// IANA timezone. Returns 0 the day a license expires, negative once it has
// lapsed, and is DST-safe because the comparison is calendar-day based rather
// than a raw millisecond delta.
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
