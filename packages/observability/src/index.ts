// biome-ignore lint/performance/noNamespaceImport: @sentry/nextjs named exports are not statically resolvable under the raw Node ESM Payload CLI; the namespace object exposes them at runtime
import * as Sentry from "@sentry/nextjs"

export function captureException(exception: unknown): string {
  // Under `payload run` (raw Node ESM, not the Next runtime) the Sentry SDK is
  // never initialized, so its methods are absent. Telemetry is fire-and-forget:
  // no-op rather than crash the operation being instrumented.
  if (typeof Sentry.captureException !== "function") {
    return ""
  }
  return Sentry.captureException(exception)
}

type LicenseContext = {
  readonly state: string
  readonly licenseType: string
}

type ScopeSentryArgs = {
  /**
   * Canonical practitioner (Payload `users`) id. `null` clears the user; omit
   * the key to leave the current user untouched.
   */
  readonly practitionerId?: string | null
  /**
   * License dimension for the current scope. `null` clears it; omit the key to
   * leave the current context untouched.
   */
  readonly license?: LicenseContext | null
}

/**
 * The single helper for attaching practitioner identity and license context to
 * Sentry. Shared by the client `SentryUser`, the server-action wrapper, and the
 * Payload hooks so identity/context resolution is never inlined per call site.
 * Sets only the keys provided, so a caller can scope the user, the license, or
 * both.
 */
export function scopeSentry({
  practitionerId,
  license,
}: ScopeSentryArgs): void {
  if (practitionerId !== undefined && typeof Sentry.setUser === "function") {
    Sentry.setUser(practitionerId === null ? null : { id: practitionerId })
  }
  if (license !== undefined && typeof Sentry.setContext === "function") {
    Sentry.setContext(
      "license",
      license === null
        ? null
        : { licenseType: license.licenseType, state: license.state }
    )
  }
}
