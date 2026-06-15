export const RENEWAL_CYCLE_OPTIONS = [
  { label: "12 months", value: "12" },
  { label: "24 months", value: "24" },
  { label: "36 months", value: "36" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export type RenewalCycleOption = (typeof RENEWAL_CYCLE_OPTIONS)[number]
export type RenewalCycleOptionValue = RenewalCycleOption["value"]

export const RENEWAL_CYCLE_OPTION_VALUES = RENEWAL_CYCLE_OPTIONS.map(
  (option) => option.value
) as ReadonlyArray<RenewalCycleOptionValue>

export const RENEWAL_CYCLE_MONTHS = [
  12, 24, 36,
] as const satisfies ReadonlyArray<number>
export type RenewalCycleMonths = (typeof RENEWAL_CYCLE_MONTHS)[number]

export const DEFAULT_RENEWAL_CYCLE_MONTHS = 24 satisfies RenewalCycleMonths

export const isRenewalCycleMonths = (
  value: number
): value is RenewalCycleMonths =>
  (RENEWAL_CYCLE_MONTHS as ReadonlyArray<number>).includes(value)

export const toRenewalCycleOptionValue = (
  months: number
): RenewalCycleOptionValue =>
  isRenewalCycleMonths(months)
    ? (String(months) as RenewalCycleOptionValue)
    : (String(DEFAULT_RENEWAL_CYCLE_MONTHS) as RenewalCycleOptionValue)
