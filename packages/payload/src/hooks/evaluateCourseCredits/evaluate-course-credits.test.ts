import type { Course, License } from "@repo/payload/payload-types"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }))
vi.mock("@repo/observability", () => ({ captureException }))
vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    withError: () => ({ error: vi.fn() }),
  }),
}))

const {
  evaluateCourseCreditsOnCourseChange,
  evaluateCourseCreditsOnLicenseChange,
} = await import("./index")

const course = (overrides: Partial<Course> = {}): Course =>
  ({
    id: "course-1",
    practitioner: "user-1",
    title: "Law & Ethics",
    completedAt: "2025-06-01T00:00:00.000Z",
    hours: 10,
    subjectCategories: ["law-and-ethics"],
    format: "live",
    source: "manual",
    updatedAt: "2025-06-02T00:00:00.000Z",
    createdAt: "2025-06-02T00:00:00.000Z",
    ...overrides,
  }) as Course

const license = (overrides: Partial<License> = {}): License =>
  ({
    id: "license-1",
    practitioner: "user-1",
    state: "CA",
    licenseType: "LCSW",
    status: "active",
    licenseNumber: "LCSW-123",
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiresAt: "2999-01-01T00:00:00.000Z",
    renewalCycleMonths: 24,
    updatedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-02T00:00:00.000Z",
    ...overrides,
  }) as License

const makePayload = ({
  licenses = [] as Array<License>,
  courses = [] as Array<Course>,
  scopeDocs = [] as Array<Record<string, unknown>>,
} = {}) => ({
  find: vi.fn(
    ({
      collection,
      where,
    }: {
      collection: string
      where?: Record<string, unknown>
    }) => {
      if (collection === "licenses") {
        return Promise.resolve({ docs: licenses })
      }
      if (collection === "courses") {
        return Promise.resolve({ docs: courses })
      }
      const isMatchQuery = Boolean(where && "and" in where)
      return Promise.resolve({ docs: isMatchQuery ? [] : scopeDocs })
    }
  ),
  create: vi.fn(() => Promise.resolve({})),
  update: vi.fn(() => Promise.resolve({})),
  delete: vi.fn(() => Promise.resolve({})),
})

const callCourseHook = (doc: Course, payload: ReturnType<typeof makePayload>) =>
  evaluateCourseCreditsOnCourseChange({ doc, req: { payload } } as never)

const callLicenseHook = (
  doc: License,
  payload: ReturnType<typeof makePayload>
) => evaluateCourseCreditsOnLicenseChange({ doc, req: { payload } } as never)

describe("evaluateCourseCreditsOnCourseChange", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("writes a credit across the practitioner's active licenses", async () => {
    const payload = makePayload({ licenses: [license()] })
    await callCourseHook(course(), payload)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "course-credits",
        data: expect.objectContaining({
          course: "course-1",
          license: "license-1",
          ruleSetKey: "CA-LCSW",
          ruleSetVersion: 1,
        }),
      })
    )
  })

  it("only queries active licenses", async () => {
    const payload = makePayload({ licenses: [license()] })
    await callCourseHook(course(), payload)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "licenses",
        where: {
          and: [
            { practitioner: { equals: "user-1" } },
            { status: { equals: "active" } },
          ],
        },
      })
    )
  })

  it("skips licenses with no shipped rule set", async () => {
    const payload = makePayload({
      licenses: [license({ state: "CO", licenseType: "LCSW" })],
    })
    await callCourseHook(course(), payload)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it("never throws when evaluation fails — the save is not blocked", async () => {
    const payload = makePayload({ licenses: [license()] })
    payload.find.mockRejectedValueOnce(new Error("db down"))
    const result = await callCourseHook(course(), payload)
    expect(result).toEqual(course())
    expect(captureException).toHaveBeenCalledOnce()
  })
})

describe("evaluateCourseCreditsOnLicenseChange", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("re-evaluates all of the practitioner's courses against the license", async () => {
    const payload = makePayload({
      courses: [
        course(),
        course({ id: "course-2", format: "webinar" as never }),
      ],
    })
    await callLicenseHook(license(), payload)
    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ course: "course-1" }),
      })
    )
  })

  it("reconciles to empty for a non-active license, deleting stale credits", async () => {
    const payload = makePayload({
      scopeDocs: [{ id: "stale", course: "course-1", license: "license-1" }],
    })
    await callLicenseHook(license({ status: "revoked" }), payload)
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "stale" })
    )
    expect(payload.find).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: "courses" })
    )
  })

  it("never throws when evaluation fails", async () => {
    const payload = makePayload({ courses: [course()] })
    payload.find.mockRejectedValueOnce(new Error("db down"))
    const doc = license()
    const result = await callLicenseHook(doc, payload)
    expect(result).toEqual(doc)
    expect(captureException).toHaveBeenCalledOnce()
  })
})
