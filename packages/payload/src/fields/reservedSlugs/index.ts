import type { TextFieldSingleValidation } from "payload"

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

/**
 * Slugs that may not be claimed as a user slug because a literal marketing
 * route already shadows the `/[userSlug]` dynamic segment at that path. Kept
 * separate from `RESERVED_SLUGS` so the `Pages` collection can still use these
 * as its own slugs.
 */
export const RESERVED_USER_SLUGS = [
  "about",
  "pricing",
  "contact",
] as const satisfies ReadonlyArray<string>

export const isReservedSlug = (value: string): boolean =>
  (RESERVED_SLUGS as ReadonlyArray<string>).includes(value)

export const isReservedUserSlug = (value: string): boolean =>
  isReservedSlug(value) ||
  (RESERVED_USER_SLUGS as ReadonlyArray<string>).includes(value)

const SLUG_FORMAT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 40

/**
 * Builds a Payload text-field validator enforcing the shared slug format
 * (lowercase kebab-case, 2–40 chars) and rejecting reserved values. Callers
 * supply the reservation predicate so user slugs and content-page slugs can
 * draw on different reserved sets.
 */
export const createSlugValidator = ({
  isReserved,
}: {
  isReserved: (value: string) => boolean
}): TextFieldSingleValidation => {
  const validate: TextFieldSingleValidation = (value): string | true => {
    if (value === undefined || value === null || value === "") {
      return true
    }
    if (typeof value !== "string") {
      return "Slug must be a string."
    }
    if (value.length < SLUG_MIN_LENGTH || value.length > SLUG_MAX_LENGTH) {
      return `Slug must be ${SLUG_MIN_LENGTH}-${SLUG_MAX_LENGTH} characters.`
    }
    if (!SLUG_FORMAT_RE.test(value)) {
      return "Slug must be lowercase letters, numbers, and single hyphens only."
    }
    if (isReserved(value)) {
      return "That slug is reserved. Please choose another."
    }
    return true
  }

  return validate
}
