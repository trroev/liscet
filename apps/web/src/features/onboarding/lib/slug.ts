import { RESERVED_SLUGS } from "@repo/payload/fields/reservedSlugs"
import slugify from "slugify"

export const SLUG_FORMAT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SLUG_MIN_LENGTH = 2
export const SLUG_MAX_LENGTH = 40

const UNDERSCORE_RE = /_/g
const MULTI_HYPHEN_RE = /-{2,}/g
const LEADING_HYPHEN_RE = /^-+/

// `trim: false` is deliberate: during keystroke-level normalization we keep the
// trailing separator (e.g. "trevor " becomes "trevor-") so the next character
// the user types lands in the next word. validateSlugFormat enforces the
// no-trailing-hyphen rule on the final submitted value.
export const formatSlug = (value: string): string =>
  slugify(value.replace(UNDERSCORE_RE, "-"), {
    lower: true,
    strict: true,
    trim: false,
  })
    .replace(MULTI_HYPHEN_RE, "-")
    .replace(LEADING_HYPHEN_RE, "")
    .slice(0, SLUG_MAX_LENGTH)

export const isReservedSlug = (value: string): boolean =>
  (RESERVED_SLUGS as ReadonlyArray<string>).includes(value)

export type SlugFormatIssue = "too-short" | "too-long" | "format"

export const validateSlugFormat = (value: string): SlugFormatIssue | null => {
  if (value.length < SLUG_MIN_LENGTH) {
    return "too-short"
  }
  if (value.length > SLUG_MAX_LENGTH) {
    return "too-long"
  }
  if (!SLUG_FORMAT_RE.test(value)) {
    return "format"
  }
  return null
}
