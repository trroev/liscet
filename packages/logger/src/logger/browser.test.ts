import { describe, expect, it, vi } from "vitest"
import { createLogger, logger } from "./browser"

describe("browser logger", () => {
  it("exposes a root logger and a createLogger factory", () => {
    expect(logger).toBeDefined()
    expect(typeof createLogger).toBe("function")
  })

  it("emits through the console transport without touching server env", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined)
    const log = createLogger({ name: "browser.test" })

    log.withMetadata({ userId: "u1" }).info("hello from the browser")

    expect(info).toHaveBeenCalled()
    info.mockRestore()
  })
})
