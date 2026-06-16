import { describe, expect, it } from "vitest"
import { activeRenewalThreshold, renewalNotificationType } from "./index"

describe("activeRenewalThreshold", () => {
  it("returns the threshold on an exact-day match", () => {
    expect(activeRenewalThreshold(90)).toBe(90)
    expect(activeRenewalThreshold(60)).toBe(60)
    expect(activeRenewalThreshold(30)).toBe(30)
    expect(activeRenewalThreshold(7)).toBe(7)
    expect(activeRenewalThreshold(1)).toBe(1)
  })

  it("catches up to the current window after a missed run", () => {
    expect(activeRenewalThreshold(88)).toBe(90)
    expect(activeRenewalThreshold(58)).toBe(60)
  })

  it("returns null beyond the widest window", () => {
    expect(activeRenewalThreshold(91)).toBeNull()
    expect(activeRenewalThreshold(120)).toBeNull()
  })

  it("returns null on or after expiry", () => {
    expect(activeRenewalThreshold(0)).toBeNull()
    expect(activeRenewalThreshold(-3)).toBeNull()
  })

  it("holds at the prior window between thresholds", () => {
    expect(activeRenewalThreshold(2)).toBe(7)
  })
})

describe("renewalNotificationType", () => {
  it("maps each threshold to its notification type", () => {
    expect(renewalNotificationType(90)).toBe("renewal-90d")
    expect(renewalNotificationType(60)).toBe("renewal-60d")
    expect(renewalNotificationType(30)).toBe("renewal-30d")
    expect(renewalNotificationType(7)).toBe("renewal-7d")
    expect(renewalNotificationType(1)).toBe("renewal-1d")
  })
})
