import { env } from "@repo/env/app"
import { init } from "@sentry/nextjs"

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
    beforeSend: (event) => {
      if (event.request?.headers) {
        const { Authorization, Cookie, authorization, cookie, ...rest } =
          event.request.headers
        event.request.headers = rest
      }
      return event
    },
  })
}
