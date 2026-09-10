/**
 * OAuth providers offered on the sign-in and sign-up forms.
 *
 * Account linking deliberately leaves better-auth's `trustedProviders` unset:
 * a trusted provider links to an existing user even when the provider reports
 * an unverified email, whereas the default gate links only on a verified
 * email claim — the behaviour every provider listed here must rely on.
 */
export const SOCIAL_PROVIDERS = [
  "google",
] as const satisfies ReadonlyArray<string>

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]
