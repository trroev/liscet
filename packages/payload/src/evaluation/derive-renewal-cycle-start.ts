import { DEFAULT_RENEWAL_CYCLE_MONTHS } from "./default-renewal-cycle"

type DeriveRenewalCycleStartArgs = {
  readonly expiresAt: string
  readonly renewalCycleMonths?: number | null
}

export function deriveRenewalCycleStart({
  expiresAt,
  renewalCycleMonths,
}: DeriveRenewalCycleStartArgs): Date {
  const months = renewalCycleMonths ?? DEFAULT_RENEWAL_CYCLE_MONTHS
  const start = new Date(expiresAt)
  start.setMonth(start.getMonth() - months)
  return start
}
