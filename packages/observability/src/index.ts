// biome-ignore lint/performance/noNamespaceImport: @sentry/nextjs named exports are not statically resolvable under the raw Node ESM Payload CLI; the namespace object exposes them at runtime
import * as Sentry from "@sentry/nextjs"

export function captureException(exception: unknown): string {
  return Sentry.captureException(exception)
}
