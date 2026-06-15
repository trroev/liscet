// The license-state union is duplicated here rather than imported from
// @repo/payload: packages/utils may not depend on packages/payload (import
// boundary). Keep this in sync with LICENSE_STATES in
// packages/payload/src/fields/licenseStates.
type LicenseState = "CA" | "MA" | "MI" | "CT"

const STATE_TIMEZONES = {
  CA: "America/Los_Angeles",
  CT: "America/New_York",
  MA: "America/New_York",
  MI: "America/Detroit",
} as const satisfies Record<LicenseState, string>

const stateToTimezone = (state: LicenseState): string => STATE_TIMEZONES[state]

export type { LicenseState }
export { STATE_TIMEZONES, stateToTimezone }
