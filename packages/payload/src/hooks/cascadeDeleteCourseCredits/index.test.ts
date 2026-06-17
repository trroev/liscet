import type { PayloadRequest } from "payload"
import { describe, expect, it, vi } from "vitest"

import {
  cascadeDeleteCourseCreditsOnCourseDelete,
  cascadeDeleteCourseCreditsOnLicenseDelete,
} from "./index"

const makeReq = () => {
  const del = vi.fn(() => Promise.resolve({ docs: [] }))
  const req = { payload: { delete: del } } as unknown as PayloadRequest
  return { del, req }
}

describe("cascadeDeleteCourseCredits", () => {
  it("deletes course-credits scoped to the removed course, in the same transaction", async () => {
    const { del, req } = makeReq()

    await cascadeDeleteCourseCreditsOnCourseDelete({
      id: "course-1",
      req,
    } as Parameters<typeof cascadeDeleteCourseCreditsOnCourseDelete>[0])

    expect(del).toHaveBeenCalledWith({
      collection: "course-credits",
      overrideAccess: true,
      req,
      where: { course: { equals: "course-1" } },
    })
  })

  it("deletes course-credits scoped to the removed license, in the same transaction", async () => {
    const { del, req } = makeReq()

    await cascadeDeleteCourseCreditsOnLicenseDelete({
      id: "license-1",
      req,
    } as Parameters<typeof cascadeDeleteCourseCreditsOnLicenseDelete>[0])

    expect(del).toHaveBeenCalledWith({
      collection: "course-credits",
      overrideAccess: true,
      req,
      where: { license: { equals: "license-1" } },
    })
  })
})
