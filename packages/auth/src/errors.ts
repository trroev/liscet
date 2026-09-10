export const GENERIC_AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again."

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

type KnownAuthErrorCode = keyof typeof FRIENDLY_AUTH_MESSAGES

const isKnownAuthErrorCode = (code: string): code is KnownAuthErrorCode =>
  code in FRIENDLY_AUTH_MESSAGES

export const friendlyAuthMessage = ({
  code,
  fallback,
}: {
  code: string | undefined
  fallback?: string
}): string => {
  if (code && isKnownAuthErrorCode(code)) {
    return FRIENDLY_AUTH_MESSAGES[code]
  }
  return fallback ?? GENERIC_AUTH_ERROR_MESSAGE
}

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

type KnownOAuthErrorCode = keyof typeof FRIENDLY_OAUTH_MESSAGES

const isKnownOAuthErrorCode = (code: string): code is KnownOAuthErrorCode =>
  code in FRIENDLY_OAUTH_MESSAGES

export const friendlyOAuthErrorMessage = ({
  code,
}: {
  code: string
}): string =>
  isKnownOAuthErrorCode(code)
    ? FRIENDLY_OAUTH_MESSAGES[code]
    : GENERIC_AUTH_ERROR_MESSAGE
