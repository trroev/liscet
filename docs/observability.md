# Observability

The app is instrumented with the three tools from the north-star (`docs/north-star.md` → "Observability"): **Sentry** for error tracking, **Axiom** for structured logs via the Vercel log drain, and **PostHog** for product analytics, session replay, and in-app feedback.

## Sentry

- Wired via `@sentry/nextjs` through `apps/web/next.config.ts` (`withSentryConfig`) plus the Next.js instrumentation hooks:
  - `apps/web/instrumentation.ts` — `register()` loads `sentry.server.config.ts` / `sentry.edge.config.ts` per `NEXT_RUNTIME`; exports `onRequestError` for server-render errors.
  - `apps/web/instrumentation-client.ts` — browser `init()` plus `onRouterTransitionStart` for client-boundary capture.
  - `apps/web/src/app/global-error.tsx` — `captureException` for the client error boundary.
- Source maps upload only in CI: `next.config.ts` sets `silent: !process.env.CI`, and the upload requires `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT`, which are present in CI and absent in dev.
- `~/components/SentryUser` calls `setUser({ id })` from the better-auth session. **Follow-up:** once the Practitioners collection exists, switch this to `setUser({ id: practitionerId })` and add `setContext('license', { state, licenseType })` in every server action and Payload hook (north-star line 259).

### Environment

`packages/env/src/app.ts` validates `NEXT_PUBLIC_SENTRY_DSN` (client), `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (server).

## Axiom

No SDK is required. Logs reach Axiom through a **Vercel log drain** configured in the Vercel project settings (Project → Settings → Log Drains → Axiom), not in code. Application logs are JSON from `@repo/logger` (pino), so structured fields — `name`, `level` (pino numeric: `error` = 50, `fatal` = 60), `msg`, `err` — are queryable once Vercel forwards them.

> Field paths below assume Vercel's Axiom integration parses the JSON log line into top-level fields. If your integration nests the parsed payload (e.g. under `message`), prefix the field references accordingly.

### Saved query: cron job failures

Surfaces error/fatal logs emitted by cron sub-loggers (created with `createLogger({ name: "cron.<job>" })`).

```kusto
['vercel']
| where ['level'] >= 50
| where ['name'] startswith "cron."
| project _time, ['name'], ['msg'], ['err.message'], ['err.stack']
| sort by _time desc
```

### Saved query: rules engine errors

Surfaces error/fatal logs from the rules engine (`@repo/rules-engine`, sub-loggers named `rules-engine.*`).

```kusto
['vercel']
| where ['level'] >= 50
| where ['name'] startswith "rules-engine"
| project _time, ['name'], ['msg'], ['err.message'], ['err.stack']
| sort by _time desc
```

Pin both as saved queries in the Axiom dashboard on day one.

## PostHog

- `~/components/PostHogProvider` initializes `posthog-js` and wraps the authenticated tree. It is mounted in `apps/web/src/app/(frontend)/layout.tsx` **only when a session exists** — marketing/anonymous traffic gets no PostHog (there is no separate `(app)` route group yet; gating by session is the equivalent).
- Privacy-first masking by default: `session_recording.maskAllInputs: true` masks every input value (including file-upload inputs where certificate filenames appear), and `maskTextSelector: "[data-ph-mask]"` redacts any element tagged `data-ph-mask`. Tag certificate filename elements with `data-ph-mask` when that UI lands.
- `~/components/FeedbackButton` is the in-app feedback widget, rendered in the authenticated layout. It captures submissions as a `survey sent` event.

### Environment

`packages/env/src/app.ts` validates `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`).
