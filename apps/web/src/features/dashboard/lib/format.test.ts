import { describe, expect, it } from "vitest"
import {
  formatCategoryLabel,
  formatLicenseLabel,
  renewalUrgency,
} from "./format"

const TODAY = new Date("2026-06-11T00:00:00.000Z")
const daysFromToday = (days: number): Date =>
  new Date(TODAY.getTime() + days * 86_400_000)

describe("formatLicenseLabel", () => {
  it("expands a known state code to its name", () => {
    expect(formatLicenseLabel({ licenseType: "LCSW", state: "CA" })).toBe(
      "California — LCSW"
    )
  })

  it("passes an unknown state code through unchanged", () => {
    expect(formatLicenseLabel({ licenseType: "LPC", state: "TX" })).toBe(
      "TX — LPC"
    )
  })
})

describe("formatCategoryLabel", () => {
  it("title-cases a kebab-case category key", () => {
    expect(formatCategoryLabel("law-and-ethics")).toBe("Law And Ethics")
  })
})

describe("renewalUrgency", () => {
  it("flags a past renewal date as overdue", () => {
    expect(renewalUrgency(daysFromToday(-1), TODAY)).toEqual({
      label: "Overdue",
      variant: "destructive",
    })
  })

  it("flags the renewal day itself as due today", () => {
    expect(renewalUrgency(TODAY, TODAY)).toEqual({
      label: "Due today",
      variant: "warning",
    })
  })

  it("warns with a day count inside the due-soon window", () => {
    expect(renewalUrgency(daysFromToday(30), TODAY)).toEqual({
      label: "Due in 30 days",
      variant: "warning",
    })
  })

  it("singularizes a one-day window", () => {
    expect(renewalUrgency(daysFromToday(1), TODAY)).toEqual({
      label: "Due in 1 day",
      variant: "warning",
    })
  })

  it("reports on track beyond the due-soon window", () => {
    expect(renewalUrgency(daysFromToday(90), TODAY)).toEqual({
      label: "On track",
      variant: "info",
    })
  })
})
