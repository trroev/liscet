# #28 — Keep the per-subsystem `@repo/env` split, add a shared base

Investigation that produced the current shape of [`@repo/env`](../../packages/env/README.md).

## Context

The original layout was six independent `createEnv()` calls (`app`, `auth`, `cloudinary`, `fetch`, `logger`, `payload`). The split bought lazy per-subsystem validation — importing `@repo/fetch` did not force `PAYLOAD_SECRET` to exist — but it had drifted: `BASE_URL` was defined in two files, and `app.ts` was the only module missing `emptyStringAsUndefined`, which crashed `pnpm dev` on a blank `NEXT_PUBLIC_SENTRY_DSN`.

## Options considered

1. **Consolidate to one `env.ts`.** Easier to scan, but importing a foundation package like `@repo/logger` would then validate `PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`, `CLOUDINARY_*`, etc. That breaks the foundation-package contract — foundation packages get pulled into contexts where higher-layer secrets don't exist.
2. **Keep as-is, document rationale.** Leaves the `BASE_URL` duplication and re-opens the drift bug class the next time someone adds a module.
3. **Keep the split, add a shared base.** ← chosen.

## Outcome

`packages/env/src/shared.ts` now owns `baseEnvOptions`, `baseUrlSchema`, `nodeEnvSchema`, and `resolveBaseUrl()`. Every module spreads `baseEnvOptions`, eliminating the missing-flag drift class. `BASE_URL` is defined exactly once (in `shared.ts`); `app.ts` uses it required, `fetch.ts` chains `.optional()` at the call site, which keeps the intentional semantic difference visible in one line without duplicating the URL schema.

## What did not change

Subpath exports, lazy per-consumer validation, the public API of every module. `@repo/env` remains a foundation package — `shared.ts` has no runtime dependency on any other workspace package.
