export const DEFAULT_REDACT_PATHS = [
  "password",
  "token",
  "authorization",
  "cookie",
  '["set-cookie"]',
  "secret",
  "*.password",
  "*.token",
  "*.authorization",
  "*.cookie",
  '*["set-cookie"]',
  "*.secret",
] as const satisfies ReadonlyArray<string>

export const mergeRedactPaths = (
  extra: ReadonlyArray<string> = []
): Array<string> => [...DEFAULT_REDACT_PATHS, ...extra]
