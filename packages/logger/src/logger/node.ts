import { PinoTransport } from "@loglayer/transport-pino"
import { env } from "@repo/env/logger"
import pino, { type DestinationStream } from "pino"
import pinoPretty from "pino-pretty"
import { buildCreateLogger, buildRootLogger } from "./build"

const isDev = env.NODE_ENV !== "production"

const stream: DestinationStream | undefined = isDev
  ? pinoPretty({
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    })
  : undefined

const pinoLogger = pino({ level: env.LOG_LEVEL }, stream)

const root = buildRootLogger({
  transport: new PinoTransport({ logger: pinoLogger }),
  level: env.LOG_LEVEL,
})

export const logger = root
export const createLogger = buildCreateLogger(root)
