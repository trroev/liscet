import { match, P } from "ts-pattern"

type ValidateExternalUrlOptions = {
  readonly allowedHosts?: ReadonlyArray<string>
}

type ValidateExternalUrlResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string }

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])

const parseUrl = (input: string): URL | null => {
  try {
    return new URL(input)
  } catch {
    return null
  }
}

export const validateExternalUrl = (
  input: string,
  options: ValidateExternalUrlOptions = {}
): ValidateExternalUrlResult => {
  const url = parseUrl(input)

  return match({ url, allowedHosts: options.allowedHosts })
    .with({ url: null }, () => ({ ok: false, reason: "invalid_url" }) as const)
    .when(
      ({ url: u }) => u !== null && !ALLOWED_PROTOCOLS.has(u.protocol),
      () => ({ ok: false, reason: "disallowed_protocol" }) as const
    )
    .when(
      ({ url: u, allowedHosts }) =>
        u !== null &&
        allowedHosts !== undefined &&
        !allowedHosts.some(
          (host) => host.toLowerCase() === u.hostname.toLowerCase()
        ),
      () => ({ ok: false, reason: "host_not_allowed" }) as const
    )
    .with(
      { url: P.nonNullable },
      ({ url: u }) => ({ ok: true, url: u }) as const
    )
    .otherwise(() => ({ ok: false, reason: "invalid_url" }) as const)
}
