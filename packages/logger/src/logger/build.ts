import { redactionPlugin } from "@loglayer/plugin-redaction"
import type { LogLayer, LogLayerTransport } from "loglayer"
import { LogLayer as LogLayerImpl } from "loglayer"
import type { LogLevel } from "./log-level"
import { mergeRedactPaths } from "./redact"
import type { CreateLoggerOptions } from "./types"

type BuildLoggerOptions = {
  readonly transport: LogLayerTransport
  readonly level: LogLevel
}

export const buildRootLogger = ({
  transport,
  level,
}: BuildLoggerOptions): LogLayer => {
  const root = new LogLayerImpl({
    transport,
    plugins: [redactionPlugin({ paths: mergeRedactPaths() })],
  })
  root.setLevel(level)
  return root
}

export const buildCreateLogger =
  (root: LogLayer) =>
  ({ name, context, redact, level }: CreateLoggerOptions = {}): LogLayer => {
    const child = root.child()
    if (redact && redact.length > 0) {
      child.addPlugins([redactionPlugin({ paths: mergeRedactPaths(redact) })])
    }
    if (name) {
      child.withContext({ name })
    }
    if (context) {
      child.withContext(context)
    }
    if (level) {
      child.setLevel(level)
    }
    return child
  }
