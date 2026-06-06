import type { LogLevelType } from "loglayer"

export const LOG_LEVELS = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const satisfies ReadonlyArray<LogLevelType>

export type LogLevel = (typeof LOG_LEVELS)[number]

export const isLogLevel = (value: unknown): value is LogLevel =>
  typeof value === "string" &&
  (LOG_LEVELS as ReadonlyArray<string>).includes(value)
