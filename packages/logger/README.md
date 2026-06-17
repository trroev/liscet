# `@repo/logger`

Sanctioned logging primitive for the monorepo. Built on [LogLayer](https://loglayer.dev). The same `logger` / `createLogger` API resolves to a runtime-appropriate transport: on the server, [pino](https://getpino.io) — structured JSON in production, [pino-pretty](https://github.com/pinojs/pino-pretty) in development, with a `LOG_LEVEL` pulled from [`@repo/env/logger`](../env/README.md); in the browser, a `ConsoleTransport`. Default secret redaction applies in both.

`console.*` is banned across the repo by Biome's `noConsole` rule; this package is the replacement.

**Layer position:** foundation. No imports from `ui`, `chrome`, `payload`, or `auth`. Isomorphic: the package's `.` export carries a `browser` condition (`src/logger/browser.ts`) and a server `default` (`src/logger/node.ts`), so the same import is safe in client and server code. The browser build never imports pino or `@repo/env`, which would otherwise throw when a server-side env var is read on the client.

## Exports

| Subpath | Owns |
|---|---|
| `@repo/logger` | `logger` (shared singleton), `createLogger(options)` — server (`default`) and browser builds expose the identical surface |

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

On the server, read from `LOG_LEVEL` via [`@repo/env/logger`](../env/README.md). The browser build can't read server env, so it derives the level from `process.env.NODE_ENV` instead. Defaults are the same in both: `info` in production, `debug` everywhere else.

## Decision log

- [#27 — How light should `@repo/logger` be?](../../docs/decisions/27-logger.md)
