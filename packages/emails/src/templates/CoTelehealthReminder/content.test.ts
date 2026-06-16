import { describe, expect, it } from "vitest"
import { coTelehealthSubject, pluralizeDays } from "./content"

describe("coTelehealthSubject", () => {
  it("uses the singular form for one day", () => {
    expect(coTelehealthSubject(1)).toBe(
      "Your Colorado telehealth registration expires in 1 day"
    )
  })

  it("uses the plural form otherwise", () => {
    expect(coTelehealthSubject(30)).toBe(
      "Your Colorado telehealth registration expires in 30 days"
    )
  })
})

describe("pluralizeDays", () => {
  it("uses the singular form for one day", () => {
    expect(pluralizeDays(1)).toBe("1 day")
  })

  it("uses the plural form otherwise", () => {
    expect(pluralizeDays(7)).toBe("7 days")
  })
})
