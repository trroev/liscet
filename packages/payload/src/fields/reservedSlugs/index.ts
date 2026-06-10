export const RESERVED_SLUGS = [
  "admin",
  "api",
  "legal",
  "onboarding",
  "posts",
  "profile",
  "settings",
  "sign-in",
  "sign-up",
] as const satisfies ReadonlyArray<string>

export const isReservedSlug = (value: string): boolean =>
  (RESERVED_SLUGS as ReadonlyArray<string>).includes(value)
