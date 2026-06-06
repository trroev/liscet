# #27 — How light should `@repo/logger` be?

Investigation that produced the current shape of [`@repo/logger`](../../packages/logger/README.md). Implementation landed in #37.

## Decision

**Collapse to a single Node/pino implementation behind the existing `createLogger` / `logger` API.**

Concretely, #37:

- Kept the `createLogger` / `logger` public API and their LogLayer return type so the three current call sites (`packages/payload/src/hooks/revalidate*`, plus the now-removed `packages/fetch`) did not change.
- Kept the secret-redaction defaults and the `LOG_LEVEL` wiring through `@repo/env/logger`.
- Deleted `src/logger/edge.ts`, `src/logger/browser.ts`, the per-runtime `package.json` `exports` conditions, the `makeImmutable` wrapper, and the `./test-transport` subpath export (inlining its capture transport into the one test that uses it).
- Updated the root `CLAUDE.md` Logging section so it no longer promises `.withContext()` returns a fresh child — call sites that need one use `.child()` explicitly, or pass `context` at `createLogger` time.

## Rationale

Three of the four runtime transports plus the immutability wrapper plus the custom test transport all defended against problems no current consumer had:

| Surface | Consumers at investigation time |
| --- | --- |
| `src/logger/edge.ts` | 0 |
| `src/logger/browser.ts` | 0 |
| `makeImmutable` (defends `.withContext` from mutating the root) | 0 — `.withContext` was not called anywhere outside docs |
| `./test-transport` subpath export | 1 — the logger's own `build.test.ts` |
| `createLogger` / `logger` + `.withMetadata` / `.withError` / `.warn` / `.error` | 3 call sites |

For a starter most forkers deploy server-only, ~250 LOC across nine files existed to ship logs to runtimes nothing currently targets. The abstraction also obscured that this is, in the end, pino.

Collapsing keeps every behavior the codebase actually depends on (sanctioned `console.*` replacement, structured JSON in prod, pino-pretty in dev, centralized redaction, the `createLogger`/`logger` API) while removing dead code and one bespoke piece of cleverness (`makeImmutable`).

If edge or browser logging is needed later, the path forward is to add a runtime-specific entry back behind an `exports` condition — the same shape that existed before, but driven by a concrete consumer instead of a guess.

## Architectural invariants preserved

- `@repo/logger` remains a foundation package — no imports from `ui`, `chrome`, `payload`, or `auth`.
- The `console.*` Biome ban (`noConsole`) keeps a sanctioned replacement (`createLogger` / `logger`) with the same import path.
- Secret-redaction defaults are unchanged.
