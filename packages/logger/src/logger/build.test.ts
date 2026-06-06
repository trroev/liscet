import {
  BaseTransport,
  type LogLayerTransportParams,
} from "@loglayer/transport"
import type { LogLevelType } from "loglayer"
import { describe, expect, it } from "vitest"
import { buildCreateLogger, buildRootLogger } from "./build"

type CapturedLog = {
  readonly level: LogLevelType
  readonly messages: ReadonlyArray<unknown>
  readonly data?: Record<string, unknown>
}

class TestCaptureTransport extends BaseTransport<Console> {
  readonly entries: Array<CapturedLog> = []

  constructor() {
    super({ id: "test-capture", logger: console })
  }

  shipToLogger({
    logLevel,
    messages,
    data,
    hasData,
  }: LogLayerTransportParams): Array<unknown> {
    this.entries.push({
      level: logLevel,
      messages: [...messages],
      data: hasData ? (data as Record<string, unknown>) : undefined,
    })
    return [...messages]
  }
}

const makeRig = (level: Parameters<typeof buildRootLogger>[0]["level"]) => {
  const transport = new TestCaptureTransport()
  const root = buildRootLogger({ transport, level })
  const createLogger = buildCreateLogger(root)
  return { transport, root, createLogger }
}

describe("buildRootLogger", () => {
  it("emits all levels at or above the configured threshold", () => {
    const { transport, root } = makeRig("info")
    root.trace("trace-msg")
    root.debug("debug-msg")
    root.info("info-msg")
    root.warn("warn-msg")
    root.error("error-msg")
    root.fatal("fatal-msg")

    const levels = transport.entries.map((entry) => entry.level)
    expect(levels).toEqual(["info", "warn", "error", "fatal"])
  })

  it("no-ops every level when threshold is fatal", () => {
    const { transport, root } = makeRig("fatal")
    root.info("nope")
    root.error("nope")
    root.fatal("yep")

    expect(transport.entries.map((entry) => entry.level)).toEqual(["fatal"])
  })

  it("redacts default sensitive keys in metadata", () => {
    const { transport, root } = makeRig("info")
    root
      .withMetadata({
        userId: "u1",
        password: "hunter2",
        token: "abc",
        authorization: "Bearer xyz",
        cookie: "sess=1",
        secret: "shh",
        nested: { password: "n-pw", token: "n-tok" },
      })
      .info("login attempt")

    const entry = transport.entries[0]
    expect(entry).toBeDefined()
    const data = entry?.data ?? {}
    expect(data.userId).toBe("u1")
    expect(data.password).toBe("[REDACTED]")
    expect(data.token).toBe("[REDACTED]")
    expect(data.authorization).toBe("[REDACTED]")
    expect(data.cookie).toBe("[REDACTED]")
    expect(data.secret).toBe("[REDACTED]")
    const nested = data.nested as Record<string, unknown>
    expect(nested.password).toBe("[REDACTED]")
    expect(nested.token).toBe("[REDACTED]")
  })

  it("captures the message in JSON-serializable shape", () => {
    const { transport, root } = makeRig("info")
    root.withMetadata({ orderId: 42 }).info("order placed")

    const entry = transport.entries[0]
    expect(entry).toBeDefined()
    const serialized = JSON.parse(
      JSON.stringify({
        level: entry?.level,
        messages: entry?.messages,
        data: entry?.data,
      })
    )
    expect(serialized.level).toBe("info")
    expect(serialized.messages).toEqual(["order placed"])
    expect(serialized.data.orderId).toBe(42)
  })
})

describe("buildCreateLogger", () => {
  it("attaches name as a structured context field", () => {
    const { transport, createLogger } = makeRig("info")
    const log = createLogger({ name: "payload.revalidate-post" })
    log.info("revalidating")

    const entry = transport.entries[0]
    expect(entry).toBeDefined()
    expect(entry?.data?.name).toBe("payload.revalidate-post")
  })

  it("does not leak context from a child back to the root", () => {
    const { transport, root, createLogger } = makeRig("info")
    const requestScoped = createLogger({ context: { userId: "u-123" } })
    requestScoped.info("child log")
    root.info("root log")

    const [childEntry, rootEntry] = transport.entries
    expect(childEntry?.data?.userId).toBe("u-123")
    expect(rootEntry?.data?.userId).toBeUndefined()
  })

  it("merges custom redact paths with the default list", () => {
    const { transport, createLogger } = makeRig("info")
    const log = createLogger({ redact: ["apiKey"] })
    log
      .withMetadata({ apiKey: "k-1", password: "p-1", safe: "ok" })
      .info("custom redact")

    const entry = transport.entries[0]
    expect(entry?.data?.apiKey).toBe("[REDACTED]")
    expect(entry?.data?.password).toBe("[REDACTED]")
    expect(entry?.data?.safe).toBe("ok")
  })
})
