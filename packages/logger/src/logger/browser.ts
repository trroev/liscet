import { ConsoleTransport } from "loglayer"
import { buildCreateLogger, buildRootLogger } from "./build"
import type { LogLevel } from "./log-level"

// The browser build can't read `@repo/env/logger` — that t3-env module throws
// when a server-side variable is accessed on the client. Next inlines
// `process.env.NODE_ENV` into client bundles; the `globalThis` guard keeps this
// safe in non-Next browser contexts. Defaults match the server: `info` in
// production, `debug` everywhere else.
const resolveBrowserLevel = (): LogLevel => {
  const nodeEnv = "process" in globalThis ? process.env.NODE_ENV : undefined
  return nodeEnv === "production" ? "info" : "debug"
}

const root = buildRootLogger({
  transport: new ConsoleTransport({ logger: console }),
  level: resolveBrowserLevel(),
})

export const logger = root
export const createLogger = buildCreateLogger(root)
