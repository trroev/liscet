import { describe, expect, it } from "vitest"
import { daysUntilExpiry } from "./index"

describe("daysUntilExpiry", () => {
  it("counts whole calendar days until expiry in the given timezone", () => {
    expect(
      daysUntilExpiry({
        expiresAt: "2026-09-13T12:00:00Z",
        now: new Date("2026-06-15T13:00:00Z"),
        timezone: "America/Los_Angeles",
      })
    ).toBe(90)
  })

  it("returns 0 on the calendar day a license expires", () => {
    expect(
      daysUntilExpiry({
        expiresAt: "2026-06-15T23:00:00Z",
        now: new Date("2026-06-15T13:00:00Z"),
        timezone: "America/New_York",
      })
    ).toBe(0)
  })

  it("returns a negative count once the license has lapsed", () => {
    expect(
      daysUntilExpiry({
        expiresAt: "2026-06-10T12:00:00Z",
        now: new Date("2026-06-15T13:00:00Z"),
        timezone: "America/New_York",
      })
    ).toBe(-5)
  })

  it("resolves the calendar day in the target timezone, not UTC", () => {
    // 2026-06-16T02:00Z is still 2026-06-15 in Los Angeles (UTC-7), so an
    // expiry at 2026-06-16T06:00Z (2026-06-15 23:00 PT) is the same LA day.
    expect(
      daysUntilExpiry({
        expiresAt: "2026-06-16T06:00:00Z",
        now: new Date("2026-06-16T02:00:00Z"),
        timezone: "America/Los_Angeles",
      })
    ).toBe(0)
  })
})
