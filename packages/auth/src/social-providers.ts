/**
 * OAuth providers enabled on the server and trusted for account linking.
 * Linking relies on the provider's verified-email claim, so only add providers
 * that guarantee `email_verified` before extending this list.
 */
export const SOCIAL_PROVIDERS = [
  "google",
] as const satisfies ReadonlyArray<string>

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]
