import type { CourseCredit } from "@repo/payload/payload-types"
import { describe, expect, it } from "vitest"
import { toCreditResult } from "./to-credit-result"

const row = (overrides: Partial<CourseCredit> = {}): CourseCredit =>
  ({
    id: "credit-1",
    course: "course-1",
    license: "license-1",
    creditedHours: 10,
    creditedCategories: ["law-and-ethics"],
    completedAt: "2025-06-01T00:00:00.000Z",
    format: "live",
    approvingBody: "APA",
    evaluatedAt: "2025-06-02T00:00:00.000Z",
    ruleSetKey: "CA-LCSW",
    ruleSetVersion: 1,
    updatedAt: "2025-06-02T00:00:00.000Z",
    createdAt: "2025-06-02T00:00:00.000Z",
    ...overrides,
  }) as CourseCredit

describe("toCreditResult", () => {
  it("reconstructs a persisted row into the engine result shape", () => {
    expect(toCreditResult(row())).toEqual({
      approvingBody: "APA",
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      courseId: "course-1",
      creditedCategories: ["law-and-ethics"],
      creditedHours: 10,
      evaluatedAt: new Date("2025-06-02T00:00:00.000Z"),
      format: "live",
      licenseId: "license-1",
      ruleSetVersion: 1,
    })
  })

  it("unwraps populated relationship refs to their ids", () => {
    const result = toCreditResult(
      row({
        course: { id: "course-9" } as never,
        license: { id: "license-9" } as never,
      })
    )
    expect(result.courseId).toBe("course-9")
    expect(result.licenseId).toBe("license-9")
  })

  it("defaults a missing approving body and categories", () => {
    const result = toCreditResult(
      row({ approvingBody: null, creditedCategories: null })
    )
    expect(result.approvingBody).toBeNull()
    expect(result.creditedCategories).toEqual([])
  })
})
