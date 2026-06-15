import { describe, expect, it } from "vitest"
import { STATE_TIMEZONES, stateToTimezone } from "./index"

describe("stateToTimezone", () => {
  it("maps each license state to its IANA timezone", () => {
    expect(stateToTimezone("CA")).toBe("America/Los_Angeles")
    expect(stateToTimezone("MA")).toBe("America/New_York")
    expect(stateToTimezone("MI")).toBe("America/Detroit")
    expect(stateToTimezone("CT")).toBe("America/New_York")
  })

  it("covers every license state in the map", () => {
    expect(Object.keys(STATE_TIMEZONES).sort()).toEqual([
      "CA",
      "CT",
      "MA",
      "MI",
    ])
  })
})
