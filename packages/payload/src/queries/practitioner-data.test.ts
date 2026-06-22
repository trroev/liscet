import { describe, expect, it, vi } from "vitest"
import { practitionerData, slugTaken } from "./practitioner-data"

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

const buildCertificateAccessor = ({
  courseDocs,
  media,
}: {
  courseDocs: Array<unknown>
  media?: unknown
}) => {
  const find = vi.fn(() => Promise.resolve({ docs: courseDocs }))
  const findByID = vi.fn(() => Promise.resolve(media ?? null))
  const accessor = practitionerData({
    payload: { find, findByID } as never,
    practitionerId: "user-1",
  })
  return { accessor, find, findByID }
}

describe("practitionerData.certificateFor", () => {
  it("scopes the course read to the requesting practitioner", async () => {
    const { accessor, find } = buildCertificateAccessor({
      courseDocs: [{ certificate: "media-1", id: "course-1" }],
      media: { blobPathname: "certs/abc.pdf" },
    })
    await accessor.certificateFor("course-1")
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "courses",
        overrideAccess: true,
        where: {
          and: [
            { id: { equals: "course-1" } },
            { practitioner: { equals: "user-1" } },
          ],
        },
      })
    )
  })

  it("denies a non-owner: an unmatched scoped read is not-found", async () => {
    const { accessor, findByID } = buildCertificateAccessor({ courseDocs: [] })
    const result = await accessor.certificateFor("someone-elses-course")
    expect(result).toEqual({ status: "not-found" })
    expect(findByID).not.toHaveBeenCalled()
  })

  it("reports a course with no certificate", async () => {
    const { accessor } = buildCertificateAccessor({
      courseDocs: [{ certificate: null, id: "course-1" }],
    })
    const result = await accessor.certificateFor("course-1")
    expect(result).toEqual({ status: "no-certificate" })
  })

  it("treats a missing blob pathname as not-found", async () => {
    const { accessor } = buildCertificateAccessor({
      courseDocs: [{ certificate: "media-1", id: "course-1" }],
      media: { blobPathname: null },
    })
    const result = await accessor.certificateFor("course-1")
    expect(result).toEqual({ status: "not-found" })
  })

  it("returns the blob pathname for an owned course's certificate", async () => {
    const { accessor, findByID } = buildCertificateAccessor({
      courseDocs: [{ certificate: { id: "media-1" }, id: "course-1" }],
      media: { blobPathname: "certs/abc.pdf" },
    })
    const result = await accessor.certificateFor("course-1")
    expect(result).toEqual({ blobPathname: "certs/abc.pdf", status: "ok" })
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "media",
        id: "media-1",
        overrideAccess: true,
      })
    )
  })
})

describe("slugTaken", () => {
  it("is taken when a user already holds the slug", async () => {
    const find = vi.fn(() => Promise.resolve({ totalDocs: 1 }))
    const taken = await slugTaken({ payload: { find } as never, slug: "ada" })
    expect(taken).toBe(true)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "users",
        overrideAccess: true,
        where: { slug: { equals: "ada" } },
      })
    )
  })

  it("is free when no user holds the slug", async () => {
    const find = vi.fn(() => Promise.resolve({ totalDocs: 0 }))
    const taken = await slugTaken({ payload: { find } as never, slug: "ada" })
    expect(taken).toBe(false)
  })
})
