import type { Course, License } from "@repo/payload/payload-types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { recreditScope } from "./recredit-scope"

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

const evaluatedAt = new Date("2026-01-01T00:00:00.000Z")

describe("recreditScope — course scope", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("credits the course across every active license", async () => {
    const payload = makePayload({
      licenses: [license(), license({ id: "license-2" })],
    })
    const summary = await recreditScope({
      evaluatedAt,
      payload: payload as never,
      scope: { course: course(), type: "course" },
    })
    expect(summary).toEqual({ created: 2, deleted: 0, updated: 0 })
    expect(payload.create).toHaveBeenCalledTimes(2)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "course-credits",
        data: expect.objectContaining({
          course: "course-1",
          license: "license-2",
          ruleSetKey: "CA-LCSW",
        }),
      })
    )
  })

  it("only loads the practitioner's active licenses", async () => {
    const payload = makePayload({ licenses: [license()] })
    await recreditScope({
      evaluatedAt,
      payload: payload as never,
      scope: { course: course(), type: "course" },
    })
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
})

describe("recreditScope — license scope", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("re-credits the license across all of the practitioner's courses", async () => {
    const payload = makePayload({ courses: [course()] })
    const summary = await recreditScope({
      evaluatedAt,
      payload: payload as never,
      scope: { license: license(), type: "license" },
    })
    expect(summary).toEqual({ created: 1, deleted: 0, updated: 0 })
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ course: "course-1" }),
      })
    )
  })

  it("clears stale credits when the license goes inactive — without loading courses", async () => {
    const payload = makePayload({
      scopeDocs: [{ id: "stale", course: "course-1", license: "license-1" }],
    })
    const summary = await recreditScope({
      evaluatedAt,
      payload: payload as never,
      scope: { license: license({ status: "revoked" }), type: "license" },
    })
    expect(summary).toEqual({ created: 0, deleted: 1, updated: 0 })
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "stale" })
    )
    expect(payload.find).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: "courses" })
    )
  })

  it("deletes stale credits on re-evaluation while keeping still-earned ones", async () => {
    const payload = makePayload({
      courses: [course()],
      scopeDocs: [{ id: "stale", course: "course-old", license: "license-1" }],
    })
    const summary = await recreditScope({
      evaluatedAt,
      payload: payload as never,
      scope: { license: license(), type: "license" },
    })
    expect(summary).toEqual({ created: 1, deleted: 1, updated: 0 })
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "stale" })
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ course: "course-1" }),
      })
    )
  })
})
