import { describe, expect, it } from "vitest"

// Regression test for the BASE_URL collision: Vite reserves BASE_URL and
// injects "/" into process.env when a Vitest config loads, which fails the
// URL schemas in `@repo/env/app` and `@repo/env/fetch`. The shared base config
// (`vitest.shared.ts`) overrides it with a valid placeholder URL — this locks
// that override in so the collision cannot silently regress.
describe("shared Vitest env override", () => {
  it("exposes BASE_URL as a parseable URL inside the Vitest process", () => {
    expect(process.env.BASE_URL).toBe("http://localhost:3000")
    expect(() => new URL(process.env.BASE_URL ?? "")).not.toThrow()
  })
})
