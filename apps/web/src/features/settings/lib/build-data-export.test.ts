import type { User } from "@repo/payload/payload-types"
import { beforeEach, describe, expect, it, vi } from "vitest"

const find = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

import { buildDataExport } from "./build-data-export"

const user = {
  id: "user-1",
  email: "u@e.co",
  displayName: "Pat",
  slug: "pat",
  timezone: "America/New_York",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as User

describe("buildDataExport", () => {
  beforeEach(() => {
    find.mockReset()
  })

  it("should nest credits under their owning course and keep license id refs", async () => {
    find.mockImplementation(({ collection }: { collection: string }) => {
      if (collection === "licenses") {
        return Promise.resolve({
          docs: [{ id: "license-1" }, { id: "license-2" }],
        })
      }
      if (collection === "courses") {
        return Promise.resolve({
          docs: [{ id: "course-1" }, { id: "course-2" }],
        })
      }
      return Promise.resolve({
        docs: [
          { id: "credit-1", course: "course-1", license: "license-1" },
          { id: "credit-2", course: "course-1", license: "license-2" },
          { id: "credit-3", course: { id: "course-2" }, license: "license-1" },
        ],
      })
    })

    const result = await buildDataExport({ user })

    expect(result.user).toEqual({
      displayName: "Pat",
      email: "u@e.co",
      slug: "pat",
      timezone: "America/New_York",
    })
    expect(result.licenses).toHaveLength(2)
    expect(result.courses[0]?.credits.map((credit) => credit.id)).toEqual([
      "credit-1",
      "credit-2",
    ])
    expect(result.courses[0]?.credits[0]?.license).toBe("license-1")
    expect(result.courses[1]?.credits.map((credit) => credit.id)).toEqual([
      "credit-3",
    ])
    expect(Date.parse(result.exportedAt)).not.toBeNaN()
  })

  it("should scope every query to the practitioner and skip credits when there are no courses", async () => {
    find.mockImplementation(({ collection }: { collection: string }) => {
      if (collection === "course-credits") {
        return Promise.reject(new Error("course-credits should not be queried"))
      }
      return Promise.resolve({ docs: [] })
    })

    const result = await buildDataExport({ user })

    expect(result.licenses).toEqual([])
    expect(result.courses).toEqual([])
    expect(find).toHaveBeenCalledTimes(2)
    for (const call of find.mock.calls) {
      const [args] = call as [{ where: { practitioner: { equals: string } } }]
      expect(args.where.practitioner.equals).toBe("user-1")
    }
  })
})
