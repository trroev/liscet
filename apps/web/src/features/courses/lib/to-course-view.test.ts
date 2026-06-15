import type { Course, CourseCredit } from "@repo/payload/payload-types"
import { describe, expect, it } from "vitest"
import { toCourseView } from "./to-course-view"

const baseCourse: Course = {
  certificate: null,
  completedAt: "2027-03-01T00:00:00.000Z",
  createdAt: "2027-03-02T00:00:00.000Z",
  format: "live",
  hours: 3,
  id: "course-1",
  practitioner: "user-1",
  provider: "Provider Inc",
  source: "manual",
  subjectCategories: ["Ethics"],
  title: "Ethics 101",
  updatedAt: "2027-03-02T00:00:00.000Z",
}

const baseCredit: CourseCredit = {
  approvingBody: null,
  completedAt: "2027-03-01T00:00:00.000Z",
  course: "course-1",
  createdAt: "2027-03-02T00:00:00.000Z",
  creditedCategories: ["Ethics"],
  creditedHours: 3,
  evaluatedAt: "2027-03-02T00:00:00.000Z",
  format: "live",
  id: "credit-1",
  license: {
    createdAt: "2025-01-01T00:00:00.000Z",
    expiresAt: "2027-01-01T00:00:00.000Z",
    id: "license-1",
    issuedAt: "2025-01-01T00:00:00.000Z",
    licenseNumber: "ABC-123",
    licenseType: "LCSW",
    practitioner: "user-1",
    state: "CA",
    status: "active",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  ruleSetKey: "CA-LCSW",
  ruleSetVersion: 1,
  updatedAt: "2027-03-02T00:00:00.000Z",
}

describe("toCourseView", () => {
  it("maps a course with populated credits to a view", () => {
    const view = toCourseView({ course: baseCourse, credits: [baseCredit] })

    expect(view).toMatchObject({
      completedAt: "2027-03-01T00:00:00.000Z",
      format: "live",
      hasCertificate: false,
      hours: 3,
      id: "course-1",
      provider: "Provider Inc",
      subjectCategories: ["Ethics"],
      title: "Ethics 101",
    })
    expect(view.credits).toEqual([
      {
        creditedCategories: ["Ethics"],
        creditedHours: 3,
        id: "credit-1",
        licenseLabel: "CA LCSW",
        licenseNumber: "ABC-123",
      },
    ])
  })

  it("reports hasCertificate when a certificate is attached", () => {
    const view = toCourseView({
      course: { ...baseCourse, certificate: "media-1" },
      credits: [],
    })
    expect(view.hasCertificate).toBe(true)
  })

  it("normalizes nullable provider and categories to safe defaults", () => {
    const view = toCourseView({
      course: { ...baseCourse, provider: null, subjectCategories: null },
      credits: [],
    })
    expect(view.provider).toBeNull()
    expect(view.subjectCategories).toEqual([])
  })

  it("falls back to a generic label when the license is unpopulated", () => {
    const view = toCourseView({
      course: baseCourse,
      credits: [
        { ...baseCredit, creditedCategories: null, license: "license-1" },
      ],
    })
    expect(view.credits[0]).toMatchObject({
      creditedCategories: [],
      licenseLabel: "License",
      licenseNumber: "",
    })
  })
})
