import { describe, expect, it, vi } from "vitest"
import { practitionerData } from "./practitioner-data"

const makePayload = () => {
  const find = vi.fn(() => Promise.resolve({ docs: [{ id: "doc-1" }] }))
  return { find }
}

const buildAccessor = (req?: unknown) => {
  const payload = makePayload()
  const accessor = practitionerData({
    payload: payload as never,
    practitionerId: "user-1",
    req: req as never,
  })
  return { accessor, find: payload.find }
}

describe("practitionerData", () => {
  it("scopes active licenses to the practitioner and active status", async () => {
    const { accessor, find } = buildAccessor()
    const docs = await accessor.activeLicenses()
    expect(docs).toEqual([{ id: "doc-1" }])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "licenses",
        overrideAccess: true,
        where: {
          and: [
            { practitioner: { equals: "user-1" } },
            { status: { equals: "active" } },
          ],
        },
      })
    )
  })

  it("scopes all licenses to the practitioner, soonest-expiring first", async () => {
    const { accessor, find } = buildAccessor()
    await accessor.licenses()
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "licenses",
        overrideAccess: true,
        sort: "expiresAt",
        where: { practitioner: { equals: "user-1" } },
      })
    )
  })

  it("scopes courses to the practitioner, newest-completion first", async () => {
    const { accessor, find } = buildAccessor()
    await accessor.courses()
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "courses",
        overrideAccess: true,
        sort: "-completedAt",
        where: { practitioner: { equals: "user-1" } },
      })
    )
  })

  it("reads credits for a single license", async () => {
    const { accessor, find } = buildAccessor()
    await accessor.creditsForLicense("license-9")
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "course-credits",
        overrideAccess: true,
        where: { license: { equals: "license-9" } },
      })
    )
  })

  it("reads credits for a set of courses, populating relations", async () => {
    const { accessor, find } = buildAccessor()
    await accessor.creditsForCourses(["course-1", "course-2"])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "course-credits",
        depth: 1,
        overrideAccess: true,
        where: { course: { in: ["course-1", "course-2"] } },
      })
    )
  })

  it("returns no credits without querying when given no course ids", async () => {
    const { accessor, find } = buildAccessor()
    const docs = await accessor.creditsForCourses([])
    expect(docs).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })

  it("threads the request into reads when supplied", async () => {
    const req = { transactionID: "tx-1" }
    const { accessor, find } = buildAccessor(req)
    await accessor.courses()
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ req }))
  })
})
