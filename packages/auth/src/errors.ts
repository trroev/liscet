export const GENERIC_AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again."

/**
 * Accepts any `string` (codes that arrive at runtime from better-auth or the
 * query string) while rejecting a string literal that is not one of the known
 * codes, so a typo at a literal call site is a compile error.
 */
type AcceptedCode<
  TInput extends string,
  TCode extends string,
> = string extends TInput ? string : TInput extends TCode ? TInput : never

export type FriendlyMessageLookup<TCode extends string> = <
  TInput extends string,
>(input: {
  code: (TInput & AcceptedCode<TInput, TCode>) | undefined
  fallback?: string
}) => string

/**
 * Builds a lookup from an error code to user-facing copy. Unknown or missing
 * codes resolve to the per-call `fallback` when given, otherwise the builder's.
 */
export const createFriendlyMessageLookup =
  <const TMessages extends Record<string, string>>({
    messages,
    fallback: defaultFallback,
  }: {
    messages: TMessages
    fallback: string
  }): FriendlyMessageLookup<keyof TMessages & string> =>
  ({ code, fallback }) => {
    const message =
      code !== undefined && Object.hasOwn(messages, code)
        ? messages[code]
        : undefined
    return message ?? fallback ?? defaultFallback
  }

const FRIENDLY_AUTH_MESSAGES = {
  INVALID_EMAIL_OR_PASSWORD: "The email or password you entered is incorrect.",
  INVALID_PASSWORD: "The email or password you entered is incorrect.",
  USER_NOT_FOUND: "No account found for that email.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  USER_ALREADY_EXISTS: "An account with that email already exists.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with that email already exists.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  INVALID_EMAIL: "Enter a valid email address.",
} as const satisfies Record<string, string>

export const friendlyAuthMessage: FriendlyMessageLookup<
  keyof typeof FRIENDLY_AUTH_MESSAGES
> = createFriendlyMessageLookup({
  messages: FRIENDLY_AUTH_MESSAGES,
  fallback: GENERIC_AUTH_ERROR_MESSAGE,
})

/**
 * Messages for the `?error=` codes better-auth appends to `errorCallbackURL`
 * when an OAuth round-trip fails after leaving the app. Codes are lower snake
 * case, unlike the upper-case API error codes above.
 */
const FRIENDLY_OAUTH_MESSAGES = {
  access_denied: "Sign-in was cancelled before finishing.",
  account_not_linked:
    "An account with that email already exists. Sign in with your password to continue.",
  email_not_found: "That account did not share an email address with us.",
  signup_disabled: "New sign-ups are currently disabled.",
  invalid_code: "Sign-in expired. Please try again.",
  no_code: "Sign-in expired. Please try again.",
  state_mismatch: "Sign-in expired. Please try again.",
  state_not_found: "Sign-in expired. Please try again.",
  please_restart_the_process: "Sign-in expired. Please try again.",
} as const satisfies Record<string, string>

export const friendlyOAuthErrorMessage: FriendlyMessageLookup<
  keyof typeof FRIENDLY_OAUTH_MESSAGES
> = createFriendlyMessageLookup({
  messages: FRIENDLY_OAUTH_MESSAGES,
  fallback: GENERIC_AUTH_ERROR_MESSAGE,
})
