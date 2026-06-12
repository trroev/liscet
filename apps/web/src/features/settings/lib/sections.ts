export const SETTINGS_SECTIONS = [
  { label: "Account", segment: "account" },
  { label: "Preferences", segment: "preferences" },
] as const satisfies ReadonlyArray<{ label: string; segment: string }>

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]
