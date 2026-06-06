# `@repo/env`

Per-subsystem environment validation built on [`@t3-oss/env-nextjs`](https://env.t3.gg/). Each consumer imports only the subpath it needs — e.g. `@repo/env/auth`, `@repo/env/logger` — and validates only those keys at first access.

**Layer position:** foundation. No imports from `ui`, `chrome`, `payload`, or `auth`.

## Layout

| Subpath | Owns |
|---|---|
| `@repo/env/app` | `BASE_URL` (required), `REVALIDATION_SECRET`, Sentry keys, `NODE_ENV` |
| `@repo/env/auth` | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI` |
| `@repo/env/cloudinary` | `CLOUDINARY_*` |
| `@repo/env/fetch` | `BASE_URL` (optional) |
| `@repo/env/logger` | `LOG_LEVEL`, `NODE_ENV` (with default) |
| `@repo/env/payload` | `PAYLOAD_*` |
| `./shared` (internal) | `baseEnvOptions`, `baseUrlSchema`, `nodeEnvSchema`, `resolveBaseUrl()` |

`shared.ts` is the single source of truth for cross-cutting concerns: the `createEnv` options every module spreads (`emptyStringAsUndefined`, `skipValidation`), the `NODE_ENV` and `BASE_URL` Zod schemas, and the `resolveBaseUrl()` helper that normalises `BASE_URL`/`VERCEL_URL` into a fully-qualified URL on `process.env`.

## Decision log

- [#28 — Keep the per-subsystem split, add a shared base](../../docs/decisions/28-env.md)
