import type { SeedPractitioner } from "@repo/db-seed/types"
import { describe, expect, it } from "vitest"
import { SEED_PAGES, SEED_PRACTITIONERS } from "./index"

// `as const satisfies` narrows away optional keys on entries that lack them,
// so the runtime asserts below need to walk the array under the wider
// SeedPractitioner shape. The narrowed type is still useful at call sites.
const practitioners: ReadonlyArray<SeedPractitioner> = SEED_PRACTITIONERS

describe("SEED_PRACTITIONERS", () => {
  it("covers every v1 home state exactly once", () => {
    const states = practitioners.map((p) => p.license.state)
    expect(states).toEqual(["CA", "MA", "MI", "CT"])
    expect(new Set(states).size).toBe(states.length)
  })

  it("has unique emails across all seeded practitioners", () => {
    const emails = practitioners.map((p) => p.email)
    expect(new Set(emails).size).toBe(emails.length)
  })

  it("has unique license numbers across all seeded practitioners", () => {
    const numbers = practitioners.map((p) => p.license.licenseNumber)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it("flags exactly one practitioner as registered for CO telehealth", () => {
    const registered = practitioners.filter(
      (p) => p.license.coTelehealth?.isRegistered === true
    )
    expect(registered).toHaveLength(1)
    expect(registered[0]?.license.state).not.toBe("CO")
  })

  it("gives every practitioner at least three courses", () => {
    for (const p of practitioners) {
      expect(p.courses.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("varies subject categories within each practitioner's course list", () => {
    for (const p of practitioners) {
      const categories = new Set(p.courses.flatMap((c) => c.subjectCategories))
      expect(categories.size).toBeGreaterThanOrEqual(2)
    }
  })

  it("uses hours >= 0.25 for every course", () => {
    for (const p of practitioners) {
      for (const c of p.courses) {
        expect(c.hours).toBeGreaterThanOrEqual(0.25)
      }
    }
  })
})

describe("SEED_PAGES", () => {
  it("backs the three literal marketing routes by slug", () => {
    const slugs = SEED_PAGES.map((page) => page.slug)
    expect(slugs).toEqual(["about", "pricing", "contact"])
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("gives every page a title, SEO meta, and a non-empty rich-text body", () => {
    for (const page of SEED_PAGES) {
      expect(page.title.length).toBeGreaterThan(0)
      expect(page.meta?.title.length).toBeGreaterThan(0)
      expect(page.meta?.description.length).toBeGreaterThan(0)
      expect(page.body.root.children.length).toBeGreaterThan(0)
    }
  })
})
