/**
 * Fallback renewal cycle length applied when a License row leaves
 * `renewalCycleMonths` unset. The single source of truth for this default —
 * the data layer's fallback, distinct from each rule set's own cycle length.
 */
export const DEFAULT_RENEWAL_CYCLE_MONTHS = 24
