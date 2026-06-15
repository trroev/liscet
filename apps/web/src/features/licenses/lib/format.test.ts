import { describe, expect, it } from "vitest"
import {
  formatLicenseDate,
  formatLicenseLabel,
  renewalUrgency,
  statusBadge,
  toDateInputValue,
} from "./format"

describe("formatLicenseLabel", () => {
  it("expands known state codes to full names", () => {
    expect(formatLicenseLabel({ licenseType: "LCSW", state: "CA" })).toBe(
      "California — LCSW"
    )
  })

  it("falls back to the raw code for unknown states", () => {
    expect(formatLicenseLabel({ licenseType: "LCSW", state: "ZZ" })).toBe(
      "ZZ — LCSW"
    )
  })
})

describe("formatLicenseDate", () => {
  it("formats an ISO timestamp in UTC, avoiding timezone drift", () => {
    expect(formatLicenseDate("2027-03-01T00:00:00.000Z")).toBe("Mar 1, 2027")
  })
})

describe("toDateInputValue", () => {
  it("reduces an ISO timestamp to a yyyy-mm-dd date input value", () => {
    expect(toDateInputValue("2027-03-01T00:00:00.000Z")).toBe("2027-03-01")
  })
})

describe("statusBadge", () => {
  it("maps each license status to a label and variant", () => {
    expect(statusBadge("active")).toEqual({
      label: "Active",
      variant: "success",
    })
    expect(statusBadge("lapsed")).toEqual({
      label: "Lapsed",
      variant: "warning",
    })
    expect(statusBadge("suspended")).toEqual({
      label: "Suspended",
      variant: "warning",
    })
    expect(statusBadge("revoked")).toEqual({
      label: "Revoked",
      variant: "destructive",
    })
  })
})

describe("renewalUrgency", () => {
  const today = new Date("2026-06-15T00:00:00.000Z")

  it("flags past dates as overdue", () => {
    expect(renewalUrgency(new Date("2026-06-14T00:00:00.000Z"), today)).toEqual(
      { label: "Overdue", variant: "destructive" }
    )
  })

  it("flags the current day as due today", () => {
    expect(renewalUrgency(new Date("2026-06-15T00:00:00.000Z"), today)).toEqual(
      { label: "Due today", variant: "warning" }
    )
  })

  it("warns when renewal is within the due-soon window", () => {
    expect(renewalUrgency(new Date("2026-06-16T00:00:00.000Z"), today)).toEqual(
      { label: "Due in 1 day", variant: "warning" }
    )
    expect(renewalUrgency(new Date("2026-07-15T00:00:00.000Z"), today)).toEqual(
      { label: "Due in 30 days", variant: "warning" }
    )
  })

  it("reports on track when renewal is comfortably out", () => {
    expect(renewalUrgency(new Date("2026-12-15T00:00:00.000Z"), today)).toEqual(
      { label: "On track", variant: "info" }
    )
  })
})
