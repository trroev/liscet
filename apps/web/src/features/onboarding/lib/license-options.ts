export const LICENSE_OPTIONS = [
  {
    label: "California — LCSW",
    licenseType: "LCSW",
    state: "CA",
    value: "CA-LCSW",
  },
  {
    label: "Massachusetts — LICSW",
    licenseType: "LICSW",
    state: "MA",
    value: "MA-LICSW",
  },
  {
    label: "Michigan — LMSW-C",
    licenseType: "LMSW-C",
    state: "MI",
    value: "MI-LMSW-C",
  },
  {
    label: "Connecticut — LICSW",
    licenseType: "LICSW",
    state: "CT",
    value: "CT-LICSW",
  },
] as const satisfies ReadonlyArray<{
  label: string
  licenseType: string
  state: string
  value: string
}>

export type LicenseOption = (typeof LICENSE_OPTIONS)[number]
export type LicenseOptionValue = LicenseOption["value"]

export const LICENSE_OPTION_VALUES = LICENSE_OPTIONS.map(
  (option) => option.value
) as ReadonlyArray<LicenseOptionValue>

export const findLicenseOption = (value: string): LicenseOption | undefined =>
  LICENSE_OPTIONS.find((option) => option.value === value)
