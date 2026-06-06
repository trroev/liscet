import { describe, expect, it } from "vitest"
import { formatDuration } from "./index"

describe("formatDuration", () => {
  it("returns minutes when under an hour", () => {
    expect(formatDuration(0)).toBe("0 min")
    expect(formatDuration(45)).toBe("45 min")
  })

  it("returns whole hours when minutes are evenly divisible by 60", () => {
    expect(formatDuration(60)).toBe("1 hr")
    expect(formatDuration(180)).toBe("3 hr")
  })

  it("returns combined hours and minutes otherwise", () => {
    expect(formatDuration(75)).toBe("1 hr 15 min")
    expect(formatDuration(125)).toBe("2 hr 5 min")
  })
})
