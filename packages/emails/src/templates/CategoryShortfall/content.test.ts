import { describe, expect, it } from "vitest"
import {
  categoryShortfallSubject,
  humanizeCategory,
  pluralizeHours,
} from "./content"

describe("categoryShortfallSubject", () => {
  it("returns a static subject line", () => {
    expect(categoryShortfallSubject()).toBe(
      "Some required CE categories are still short"
    )
  })
})

describe("humanizeCategory", () => {
  it("replaces hyphens with spaces and capitalizes the first word", () => {
    expect(humanizeCategory("law-and-ethics")).toBe("Law and ethics")
  })

  it("capitalizes a single-word category", () => {
    expect(humanizeCategory("clinical")).toBe("Clinical")
  })
})

describe("pluralizeHours", () => {
  it("uses the singular form for one hour", () => {
    expect(pluralizeHours(1)).toBe("1 hour")
  })

  it("uses the plural form otherwise", () => {
    expect(pluralizeHours(4)).toBe("4 hours")
  })
})
