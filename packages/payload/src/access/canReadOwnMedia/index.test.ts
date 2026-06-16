import { describe, expect, it, vi } from "vitest"
import { canReadOwnMedia } from "./index"

type AccessArgs = Parameters<typeof canReadOwnMedia>[0]

const makeArgs = ({
  user,
  find,
}: {
  user: unknown
  find?: ReturnType<typeof vi.fn>
}): AccessArgs =>
  ({
    req: { payload: { find: find ?? vi.fn() }, user },
  }) as unknown as AccessArgs

describe("canReadOwnMedia", () => {
  it("denies unauthenticated requests", async () => {
    await expect(canReadOwnMedia(makeArgs({ user: null }))).resolves.toBe(false)
  })

  it("allows admins to read everything", async () => {
    const result = await canReadOwnMedia(
      makeArgs({ user: { collection: "admins", id: "admin-1" } })
    )
    expect(result).toBe(true)
  })

  it("limits a practitioner to their own certificate and avatar media", async () => {
    const find = vi.fn(async () => ({
      docs: [
        { certificate: "media-1" },
        { certificate: { id: "media-2" } },
        { certificate: null },
      ],
    }))

    const result = await canReadOwnMedia(
      makeArgs({
        find,
        user: { avatar: "avatar-1", collection: "users", id: "user-1" },
      })
    )

    expect(result).toEqual({ id: { in: ["media-1", "media-2", "avatar-1"] } })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "courses",
        where: { practitioner: { in: ["user-1"] } },
      })
    )
  })

  it("denies a practitioner who owns no media", async () => {
    const find = vi.fn(async () => ({ docs: [] }))
    const result = await canReadOwnMedia(
      makeArgs({ find, user: { collection: "users", id: "user-1" } })
    )
    expect(result).toBe(false)
  })
})
