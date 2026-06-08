export const LICENSE_STATES = [
  { label: "California", value: "CA" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Connecticut", value: "CT" },
  { label: "Colorado", value: "CO" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>
