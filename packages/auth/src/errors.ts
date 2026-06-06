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
