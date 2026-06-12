const WHITESPACE_RE = /\s+/

export const buildInitials = (source: string): string =>
  source
    .split(WHITESPACE_RE)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") ||
  source.charAt(0).toUpperCase() ||
  "?"
