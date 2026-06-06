export const ALLOWED_LINK_SCHEMES = [
  "http:",
  "https:",
  "mailto:",
  "tel:",
] as const satisfies ReadonlyArray<string>

export type AllowedLinkScheme = (typeof ALLOWED_LINK_SCHEMES)[number]
