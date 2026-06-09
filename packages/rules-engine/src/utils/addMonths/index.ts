type AddMonthsArgs = {
  readonly date: Date
  readonly months: number
}

/**
 * Add `months` calendar months to `date` using UTC fields, clamping to the
 * last valid day of the target month (Jan 31 + 1 month → Feb 28/29). UTC keeps
 * the result independent of the host timezone, matching the deterministic,
 * pure-function contract of the rules engine.
 */
export function addMonths({ date, months }: AddMonthsArgs): Date {
  const targetDay = date.getUTCDate()
  const result = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate()
  result.setUTCDate(Math.min(targetDay, daysInTargetMonth))
  return result
}
