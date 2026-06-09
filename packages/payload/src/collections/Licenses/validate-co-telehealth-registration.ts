import type { CheckboxFieldValidation } from "payload"

// Telehealth-into-CO registration (C.R.S. § 12-30-124) describes practicing into
// Colorado from another state's license — it is meaningless on a CO license itself.
export const validateCoTelehealthRegistration: CheckboxFieldValidation = (
  value,
  { data }
): string | true => {
  const state = (data as { state?: string } | undefined)?.state
  return value === true && state === "CO"
    ? "A CO license cannot also be registered for telehealth into Colorado."
    : true
}
