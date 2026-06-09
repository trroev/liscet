import { beforeEach, describe, expect, it, vi } from "vitest"
import { type CreditToPersist, reconcileCredits } from "./reconcile-credits"

const credit = (overrides: Partial<CreditToPersist> = {}): CreditToPersist => ({
  courseId: "course-1",
  licenseId: "license-1",
  creditedHours: 10,
  creditedCategories: ["law-and-ethics"],
  evaluatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ruleSetKey: "CA-LCSW",
  ruleSetVersion: 1,
  ...overrides,
})

const makePayload = ({
  scopeDocs = [] as Array<Record<string, unknown>>,
  matchDocs = [] as Array<Record<string, unknown>>,
} = {}) => ({
  find: vi.fn(({ where }: { where?: Record<string, unknown> }) => {
    const isMatchQuery = Boolean(where && "and" in where)
    return Promise.resolve({ docs: isMatchQuery ? matchDocs : scopeDocs })
  }),
  create: vi.fn(() => Promise.resolve({})),
  update: vi.fn(() => Promise.resolve({})),
  delete: vi.fn(() => Promise.resolve({})),
})

const req = {} as never

describe("reconcileCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a row when no matching credit exists", async () => {
    const payload = makePayload()
    await reconcileCredits({
      credits: [credit()],
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "course-credits",
        data: expect.objectContaining({
          course: "course-1",
          license: "license-1",
          creditedHours: 10,
          ruleSetKey: "CA-LCSW",
          ruleSetVersion: 1,
        }),
        overrideAccess: true,
      })
    )
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it("updates the existing row instead of creating a duplicate", async () => {
    const payload = makePayload({
      scopeDocs: [{ id: "cc-1", course: "course-1", license: "license-1" }],
      matchDocs: [{ id: "cc-1", course: "course-1", license: "license-1" }],
    })
    await reconcileCredits({
      credits: [credit()],
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "course-credits", id: "cc-1" })
    )
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it("deletes in-scope rows that no longer earn credit", async () => {
    const payload = makePayload({
      scopeDocs: [{ id: "stale", course: "course-1", license: "license-old" }],
    })
    await reconcileCredits({
      credits: [],
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "course-credits", id: "stale" })
    )
    expect(payload.create).not.toHaveBeenCalled()
  })

  it("returns a summary of created, updated, and deleted rows", async () => {
    const payload = makePayload({
      scopeDocs: [
        { id: "keep", course: "course-1", license: "license-1" },
        { id: "drop", course: "course-1", license: "license-old" },
      ],
      matchDocs: [{ id: "keep", course: "course-1", license: "license-1" }],
    })
    const summary = await reconcileCredits({
      credits: [credit()],
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(summary).toEqual({ created: 0, deleted: 1, updated: 1 })
  })

  it("dry run reports the plan without writing", async () => {
    const payload = makePayload({
      scopeDocs: [{ id: "drop", course: "course-1", license: "license-old" }],
    })
    const summary = await reconcileCredits({
      credits: [credit()],
      dryRun: true,
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(summary).toEqual({ created: 1, deleted: 1, updated: 0 })
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it("keeps a still-valid row while deleting a stale sibling", async () => {
    const payload = makePayload({
      scopeDocs: [
        { id: "keep", course: "course-1", license: "license-1" },
        { id: "drop", course: "course-1", license: "license-old" },
      ],
      matchDocs: [{ id: "keep", course: "course-1", license: "license-1" }],
    })
    await reconcileCredits({
      credits: [credit()],
      payload: payload as never,
      req,
      scope: { course: { equals: "course-1" } },
    })
    expect(payload.delete).toHaveBeenCalledTimes(1)
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "drop" })
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: "keep" })
    )
  })
})
