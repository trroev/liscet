export const LICENSE_STATES = [
  { label: "California", value: "CA" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Connecticut", value: "CT" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>
