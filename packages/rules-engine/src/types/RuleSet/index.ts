export type RuleSetState = "CA" | "MA" | "MI" | "CT" | "CO"

export type RuleSetLicenseType = "LCSW" | "LICSW" | "LMSW-C"

export type CourseFormat = "live" | "home-study" | "in-person"

/**
 * Closed union by design: adding a state that needs a new category is a
 * deliberate edit here, never a free-form string.
 */
export type SubjectCategory =
  | "general"
  | "law-and-ethics"
  | "ethics"
  | "clinical"
  | "cultural-competency"
  | "suicide-risk"
  | "telehealth"
  | "human-trafficking"
  | "pain-symptom-management"
  | "anti-racism"
  | "anti-discrimination"
  | "domestic-sexual-violence"
  | "veterans-mental-health"

/**
 * Runtime value set mirroring the `SubjectCategory` union — the single source
 * of truth for mapping raw, unnormalized course tags onto the closed union.
 */
export const SUBJECT_CATEGORIES = [
  "general",
  "law-and-ethics",
  "ethics",
  "clinical",
  "cultural-competency",
  "suicide-risk",
  "telehealth",
  "human-trafficking",
  "pain-symptom-management",
  "anti-racism",
  "anti-discrimination",
  "domestic-sexual-violence",
  "veterans-mental-health",
] as const satisfies ReadonlyArray<SubjectCategory>

export type CategoryMinimum = {
  readonly category: SubjectCategory
  readonly minHours: number
}

export type FormatConstraint =
  | {
      readonly kind: "min-hours"
      readonly formats: ReadonlyArray<CourseFormat>
      readonly hours: number
    }
  | {
      readonly kind: "max-hours"
      readonly formats: ReadonlyArray<CourseFormat>
      readonly hours: number
    }
  | {
      readonly kind: "max-fraction"
      readonly formats: ReadonlyArray<CourseFormat>
      readonly fraction: number
    }

/**
 * Closed union by design: the accrediting organizations whose approval a state
 * recognizes for provider-based hour caps. Adding a body is a deliberate edit
 * here, never a free-form string.
 */
export type ApprovingBody = "APA" | "NBCC" | "NHA" | "ANCC" | "ACCME"

/**
 * Caps keyed to a course's *approving body* (accrediting organization) rather
 * than its delivery `CourseFormat` — an orthogonal dimension to
 * `FormatConstraint`. Only cap kinds are modeled; a provider-keyed minimum is
 * not a recognized regulatory shape.
 */
export type ProviderCap =
  | {
      readonly kind: "max-hours"
      readonly approvingBodies: ReadonlyArray<ApprovingBody>
      readonly hours: number
    }
  | {
      readonly kind: "max-fraction"
      readonly approvingBodies: ReadonlyArray<ApprovingBody>
      readonly fraction: number
    }

export type Recurrence = "one-time" | { readonly everyMonths: number }

export type SpecialRequirement = {
  readonly category: SubjectCategory
  readonly minHours: number
  readonly recurrence: Recurrence
  /**
   * ISO 8601 date (YYYY-MM-DD) the requirement first applies. Gated on the
   * license's renewal/reactivation date — a requirement is owed only when that
   * date is on or after `effectiveFrom`. Omit for an always-effective requirement.
   */
  readonly effectiveFrom?: string
}

export type RuleSet = {
  readonly state: RuleSetState
  readonly licenseType: RuleSetLicenseType
  readonly version: number
  readonly renewalCycleMonths: number
  readonly totalHours: number
  /** Formats eligible to earn credit at all; gates before any credit calculation. */
  readonly acceptedFormats: ReadonlyArray<CourseFormat>
  readonly categoryMinimums: ReadonlyArray<CategoryMinimum>
  readonly formatConstraints: ReadonlyArray<FormatConstraint>
  /** Caps keyed to a course's approving body; orthogonal to `formatConstraints`. */
  readonly providerCaps: ReadonlyArray<ProviderCap>
  readonly specialRequirements: ReadonlyArray<SpecialRequirement>
  /** `null` = no carry-over allowed. */
  readonly carryOverMaxHours: number | null
}
