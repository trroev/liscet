import { describe, expect, it } from "vitest"
import { formatCourseDate, formatCourseFormat, formatHours } from "./format"

describe("formatCourseDate", () => {
  it("formats an ISO timestamp in UTC, avoiding timezone drift", () => {
    expect(formatCourseDate("2027-03-01T00:00:00.000Z")).toBe("Mar 1, 2027")
  })

  it("does not roll back across a day boundary at UTC midnight", () => {
    expect(formatCourseDate("2027-01-01T00:00:00.000Z")).toBe("Jan 1, 2027")
  })
})

describe("formatHours", () => {
  it("uses the singular noun for exactly one hour", () => {
    expect(formatHours(1)).toBe("1 hour")
  })

  it("uses the plural noun otherwise, including fractional hours", () => {
    expect(formatHours(0.5)).toBe("0.5 hours")
    expect(formatHours(3)).toBe("3 hours")
  })
})

describe("formatCourseFormat", () => {
  it("maps each format value to a human label", () => {
    expect(formatCourseFormat("live")).toBe("Live")
    expect(formatCourseFormat("home-study")).toBe("Home Study")
    expect(formatCourseFormat("in-person")).toBe("In Person")
  })
})
