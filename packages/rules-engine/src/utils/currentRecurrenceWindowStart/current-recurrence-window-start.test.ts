import { describe, expect, it } from "vitest"
import { currentRecurrenceWindowStart } from "./index"

const ANCHOR = new Date("2020-01-01T00:00:00.000Z")

describe("currentRecurrenceWindowStart", () => {
  it("returns null for a one-time requirement", () => {
    expect(
      currentRecurrenceWindowStart({
        recurrence: "one-time",
        anchor: ANCHOR,
        asOf: new Date("2025-01-01T00:00:00.000Z"),
      })
    ).toBeNull()
  })

  it("returns the anchor when asOf is before it", () => {
    expect(
      currentRecurrenceWindowStart({
        recurrence: { everyMonths: 72 },
        anchor: ANCHOR,
        asOf: new Date("2019-06-01T00:00:00.000Z"),
      })
    ).toEqual(ANCHOR)
  })

  it("returns the anchor within the first window", () => {
    expect(
      currentRecurrenceWindowStart({
        recurrence: { everyMonths: 72 },
        anchor: ANCHOR,
        asOf: new Date("2024-12-31T00:00:00.000Z"),
      })
    ).toEqual(ANCHOR)
  })

  it("advances to the next window start exactly on the boundary", () => {
    // 72 months after 2020-01-01 is 2026-01-01.
    expect(
      currentRecurrenceWindowStart({
        recurrence: { everyMonths: 72 },
        anchor: ANCHOR,
        asOf: new Date("2026-01-01T00:00:00.000Z"),
      })
    ).toEqual(new Date("2026-01-01T00:00:00.000Z"))
  })

  it("stays in the second window mid-period", () => {
    expect(
      currentRecurrenceWindowStart({
        recurrence: { everyMonths: 72 },
        anchor: ANCHOR,
        asOf: new Date("2030-06-01T00:00:00.000Z"),
      })
    ).toEqual(new Date("2026-01-01T00:00:00.000Z"))
  })

  it("advances multiple windows in", () => {
    // Third window starts 144 months after anchor: 2032-01-01.
    expect(
      currentRecurrenceWindowStart({
        recurrence: { everyMonths: 72 },
        anchor: ANCHOR,
        asOf: new Date("2033-01-01T00:00:00.000Z"),
      })
    ).toEqual(new Date("2032-01-01T00:00:00.000Z"))
  })
})
