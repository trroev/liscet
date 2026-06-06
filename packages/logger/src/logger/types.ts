import type { LogLayer } from "loglayer"
import type { LogLevel } from "./log-level"

export type Logger = LogLayer

export type CreateLoggerOptions = {
  readonly name?: string
  readonly context?: Readonly<Record<string, unknown>>
  readonly redact?: ReadonlyArray<string>
  readonly level?: LogLevel
}
