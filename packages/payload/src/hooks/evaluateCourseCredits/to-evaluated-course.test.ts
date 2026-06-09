import type { Course } from "@repo/payload/payload-types"
import { describe, expect, it } from "vitest"
import { toEvaluatedCourse } from "./to-evaluated-course"

const baseCourse = (overrides: Partial<Course> = {}): Course =>
  ({
    id: "course-1",
    practitioner: "user-1",
    title: "Ethics 101",
    completedAt: "2025-06-01T00:00:00.000Z",
    hours: 10,
    subjectCategories: ["law-and-ethics"],
    format: "live",
    source: "manual",
    updatedAt: "2025-06-02T00:00:00.000Z",
    createdAt: "2025-06-02T00:00:00.000Z",
    ...overrides,
  }) as Course

describe("toEvaluatedCourse", () => {
  it("maps a Courses doc into the rules-engine input shape", () => {
    const evaluated = toEvaluatedCourse(baseCourse({ provider: "APA" }))
    expect(evaluated).toEqual({
      courseId: "course-1",
      completedAt: new Date("2025-06-01T00:00:00.000Z"),
      hours: 10,
      format: "live",
      subjectCategories: ["law-and-ethics"],
      approvingBody: "APA",
    })
  })

  it("defaults missing subject categories to an empty array", () => {
    const evaluated = toEvaluatedCourse(baseCourse({ subjectCategories: null }))
    expect(evaluated.subjectCategories).toEqual([])
  })

  it("maps a missing provider to a null approving body", () => {
    const evaluated = toEvaluatedCourse(baseCourse({ provider: null }))
    expect(evaluated.approvingBody).toBeNull()
  })
})
