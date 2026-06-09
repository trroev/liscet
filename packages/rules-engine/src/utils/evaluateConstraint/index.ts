import type { ConstraintProgress } from "@repo/rules-engine/types/ProgressSummary"

type EvaluateConstraintArgs = {
  readonly kind: ConstraintProgress["kind"]
  readonly creditedHours: number
  readonly limitHours: number
}

/**
 * Resolve an aggregate hour constraint to a `ConstraintProgress`. A `min-hours`
 * constraint is satisfied at or above its limit; the `max-*` kinds are
 * satisfied at or below it. Pure and shared by format constraints and provider
 * caps, which are structurally identical once a fraction is resolved to hours.
 */
export function evaluateConstraint({
  kind,
  creditedHours,
  limitHours,
}: EvaluateConstraintArgs): ConstraintProgress {
  const satisfied =
    kind === "min-hours"
      ? creditedHours >= limitHours
      : creditedHours <= limitHours
  return { kind, creditedHours, limitHours, satisfied }
}
