import { describe, expect, it, vi } from "vitest"
import { createLogger } from "./browser"

describe("browser logger", () => {
  it("emits through the console transport without touching server env", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined)
    const log = createLogger({ name: "browser.test" })

    log.withMetadata({ userId: "u1" }).info("hello from the browser")

    expect(info).toHaveBeenCalled()
    info.mockRestore()
  })
})
