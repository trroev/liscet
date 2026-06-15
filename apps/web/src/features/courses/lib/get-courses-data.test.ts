import { beforeEach, describe, expect, it, vi } from "vitest"

const find = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

describe("getCoursesData", () => {
  beforeEach(() => {
    vi.resetModules()
    find.mockReset()
  })

  it("queries the practitioner's courses newest-completion first", async () => {
    find.mockResolvedValueOnce({ docs: [] })
    const { getCoursesData } = await import("./get-courses-data")

    await getCoursesData("user-1")

    expect(find).toHaveBeenCalledWith({
      collection: "courses",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      sort: "-completedAt",
      where: { practitioner: { equals: "user-1" } },
    })
  })

  it("does not query credits when the practitioner has no courses", async () => {
    find.mockResolvedValueOnce({ docs: [] })
    const { getCoursesData } = await import("./get-courses-data")

    const { courses } = await getCoursesData("user-1")

    expect(courses).toEqual([])
    expect(find).toHaveBeenCalledTimes(1)
  })

  it("groups credits onto their owning course", async () => {
    find
      .mockResolvedValueOnce({
        docs: [
          {
            certificate: null,
            completedAt: "2027-03-01T00:00:00.000Z",
            format: "live",
            hours: 3,
            id: "course-1",
            practitioner: "user-1",
            provider: "Provider Inc",
            subjectCategories: ["Ethics"],
            title: "Ethics 101",
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            course: "course-1",
            creditedCategories: ["Ethics"],
            creditedHours: 3,
            id: "credit-1",
            license: {
              id: "license-1",
              licenseNumber: "ABC-123",
              licenseType: "LCSW",
              state: "CA",
            },
          },
        ],
      })
    const { getCoursesData } = await import("./get-courses-data")

    const { courses } = await getCoursesData("user-1")

    expect(find).toHaveBeenNthCalledWith(2, {
      collection: "course-credits",
      depth: 1,
      overrideAccess: true,
      pagination: false,
      where: { course: { in: ["course-1"] } },
    })
    expect(courses).toHaveLength(1)
    expect(courses[0]?.credits).toEqual([
      {
        creditedCategories: ["Ethics"],
        creditedHours: 3,
        id: "credit-1",
        licenseLabel: "CA LCSW",
        licenseNumber: "ABC-123",
      },
    ])
  })
})
