# `@repo/logger`

Sanctioned logging primitive for the monorepo. Built on [LogLayer](https://loglayer.dev) with [pino](https://getpino.io) as the underlying transport — structured JSON in production, [pino-pretty](https://github.com/pinojs/pino-pretty) in development. Default secret redaction, and a `LOG_LEVEL`-driven level pulled from [`@repo/env/logger`](../env/README.md).

`console.*` is banned across the repo by Biome's `noConsole` rule; this package is the replacement.

**Layer position:** foundation. No imports from `ui`, `chrome`, `payload`, or `auth`. Node-only by design — see [docs/decisions/27-logger.md](../../docs/decisions/27-logger.md) for the rationale.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/logger` | `logger` (shared singleton), `createLogger(options)` |

## Usage

```ts
import { createLogger, logger } from "@repo/logger"

// Per-module sub-logger — the `name` becomes a structured field.
const log = createLogger({ name: "payload.revalidate-post" })

log.withMetadata({ status: 502 }).error("revalidation failed")
log.withError(err).error("request failed")

// Scoped logger: pass context at creation, or branch a child explicitly.
const requestLog = createLogger({ name: "api.request", context: { requestId } })
const childLog = log.child().withContext({ requestId })
```

`.withContext()` mutates its receiver. To get a scoped logger that does not leak back onto the long-lived root, use `createLogger({ context })` at creation time or branch with `.child()` first.

## Redaction

Defaults redact `password`, `token`, `authorization`, `cookie`, `set-cookie`, `secret` at the top level and one nested level. Pass `createLogger({ redact: ["apiKey"] })` to extend.

## Level

Read from `LOG_LEVEL` via [`@repo/env/logger`](../env/README.md). Defaults: `info` in production, `debug` everywhere else.

## Decision log

- [#27 — How light should `@repo/logger` be?](../../docs/decisions/27-logger.md)
