import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe("@repo/observability", () => {
  it("forwards to the Sentry SDK when it is initialized", async () => {
    const captureException = vi.fn(() => "event-1")
    const setUser = vi.fn()
    const setContext = vi.fn()
    vi.doMock("@sentry/nextjs", () => ({
      captureException,
      setContext,
      setUser,
    }))

    const observability = await import("./index")
    const eventId = observability.captureException(new Error("boom"))
    observability.scopeSentry({
      practitionerId: "user-1",
      license: { licenseType: "LCSW", state: "CA" },
    })

    expect(eventId).toBe("event-1")
    expect(setUser).toHaveBeenCalledWith({ id: "user-1" })
    expect(setContext).toHaveBeenCalledWith("license", {
      licenseType: "LCSW",
      state: "CA",
    })
  })

  it("no-ops without throwing when the SDK is uninitialized", async () => {
    // Mirrors `payload run`: the members exist on the namespace but are not
    // callable, so accessing them succeeds while calling them would throw.
    vi.doMock("@sentry/nextjs", () => ({
      captureException: undefined,
      setContext: undefined,
      setUser: undefined,
    }))

    const observability = await import("./index")

    expect(observability.captureException(new Error("boom"))).toBe("")
    expect(() =>
      observability.scopeSentry({
        practitionerId: "user-1",
        license: { licenseType: "LCSW", state: "CA" },
      })
    ).not.toThrow()
  })

  it("clears user and license context when passed null", async () => {
    const setUser = vi.fn()
    const setContext = vi.fn()
    vi.doMock("@sentry/nextjs", () => ({
      captureException: vi.fn(),
      setContext,
      setUser,
    }))

    const observability = await import("./index")
    observability.scopeSentry({ practitionerId: null, license: null })

    expect(setUser).toHaveBeenCalledWith(null)
    expect(setContext).toHaveBeenCalledWith("license", null)
  })
})
