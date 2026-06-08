import { env } from "@repo/env/app"
import { captureRouterTransitionStart, init } from "@sentry/nextjs"

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
  })
}

export const onRouterTransitionStart = captureRouterTransitionStart
