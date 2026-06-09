import { describe, expect, it } from "vitest"
import { evaluateConstraint } from "./index"

describe("evaluateConstraint", () => {
  it("satisfies a min-hours constraint at or above the limit", () => {
    expect(
      evaluateConstraint({
        kind: "min-hours",
        creditedHours: 22.5,
        limitHours: 22.5,
      })
    ).toEqual({
      kind: "min-hours",
      creditedHours: 22.5,
      limitHours: 22.5,
      satisfied: true,
    })
  })

  it("fails a min-hours constraint below the limit", () => {
    expect(
      evaluateConstraint({
        kind: "min-hours",
        creditedHours: 20,
        limitHours: 22.5,
      }).satisfied
    ).toBe(false)
  })

  it("satisfies a max-hours constraint at or below the limit", () => {
    expect(
      evaluateConstraint({
        kind: "max-hours",
        creditedHours: 10,
        limitHours: 10,
      }).satisfied
    ).toBe(true)
  })

  it("fails a max-hours constraint above the limit", () => {
    expect(
      evaluateConstraint({
        kind: "max-hours",
        creditedHours: 12,
        limitHours: 10,
      }).satisfied
    ).toBe(false)
  })

  it("treats max-fraction like a max cap on its resolved hours limit", () => {
    expect(
      evaluateConstraint({
        kind: "max-fraction",
        creditedHours: 9,
        limitHours: 7.5,
      }).satisfied
    ).toBe(false)
  })
})
