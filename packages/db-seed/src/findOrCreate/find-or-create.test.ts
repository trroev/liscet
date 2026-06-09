import type { Payload } from "payload"
import { describe, expect, it, vi } from "vitest"
import { findOrCreate } from "./index"

type CreateArgs = Parameters<Payload["create"]>[0]

const buildPayload = ({
  existing,
}: {
  existing: ReadonlyArray<{ id: string }>
}): Payload => {
  const find = vi.fn().mockResolvedValue({ docs: existing })
  const create = vi.fn((args: CreateArgs) =>
    Promise.resolve({ id: `created-${args.collection}` })
  )
  return { find, create } as unknown as Payload
}

describe("findOrCreate", () => {
  it("returns the existing doc id without creating when a match is found", async () => {
    const payload = buildPayload({ existing: [{ id: "user-1" }] })

    const result = await findOrCreate({
      payload,
      collection: "users",
      where: { email: { equals: "x@y.test" } },
      data: { email: "x@y.test" },
    })

    expect(result).toEqual({ created: false, id: "user-1" })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it("creates and returns the new id when no match exists", async () => {
    const payload = buildPayload({ existing: [] })

    const result = await findOrCreate({
      payload,
      collection: "users",
      where: { email: { equals: "new@y.test" } },
      data: { email: "new@y.test" },
    })

    expect(result).toEqual({ created: true, id: "created-users" })
    expect(payload.create).toHaveBeenCalledOnce()
  })

  it("passes overrideAccess on both find and create calls", async () => {
    const payload = buildPayload({ existing: [] })

    await findOrCreate({
      payload,
      collection: "courses",
      where: { title: { equals: "t" } },
      data: {
        practitioner: "u1",
        title: "t",
        completedAt: "2026-01-01",
        hours: 1,
        format: "live",
      },
    })

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: true })
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: true })
    )
  })
})
