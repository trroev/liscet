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

export type Recurrence = "one-time" | { readonly everyMonths: number }

export type SpecialRequirement = {
  readonly category: SubjectCategory
  readonly minHours: number
  readonly recurrence: Recurrence
}

export type RuleSet = {
  readonly state: RuleSetState
  readonly licenseType: RuleSetLicenseType
  readonly version: number
  readonly renewalCycleMonths: number
  readonly totalHours: number
  readonly categoryMinimums: ReadonlyArray<CategoryMinimum>
  readonly formatConstraints: ReadonlyArray<FormatConstraint>
  readonly specialRequirements: ReadonlyArray<SpecialRequirement>
  /** `null` = no carry-over allowed. */
  readonly carryOverMaxHours: number | null
}
