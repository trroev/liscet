import type { Recurrence } from "@repo/rules-engine/types/RuleSet"
import { addMonths } from "@repo/rules-engine/utils/addMonths"

type CurrentRecurrenceWindowStartArgs = {
  readonly recurrence: Recurrence
  readonly anchor: Date
  readonly asOf: Date
}

/**
 * Start of the recurrence window in force as of `asOf`, or `null` for a
 * one-time requirement (which never windows — credits accumulate for good).
 * Windows are `everyMonths` long and anchored at `anchor`; the current window
 * is the one containing `asOf`. UTC month math, consistent with `addMonths`.
 */
export function currentRecurrenceWindowStart({
  recurrence,
  anchor,
  asOf,
}: CurrentRecurrenceWindowStartArgs): Date | null {
  if (recurrence === "one-time") {
    return null
  }

  const monthsElapsed =
    (asOf.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (asOf.getUTCMonth() - anchor.getUTCMonth()) -
    (asOf.getUTCDate() < anchor.getUTCDate() ? 1 : 0)

  const windowsElapsed = Math.max(
    0,
    Math.floor(monthsElapsed / recurrence.everyMonths)
  )

  return addMonths({
    date: anchor,
    months: windowsElapsed * recurrence.everyMonths,
  })
}
