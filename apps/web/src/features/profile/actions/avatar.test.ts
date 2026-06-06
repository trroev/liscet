import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const find = vi.fn()
const update = vi.fn()
const create = vi.fn()
const deleteFn = vi.fn()
const payloadAuth = vi.fn(async () => ({ user: null }))

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadAuth,
    find,
    update,
    create,
    delete: deleteFn,
  })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/features/auth/auth.server", () => ({
  auth: { api: { getSession } },
}))

const makeFile = (
  name: string,
  type: string,
  bytes: number,
  contents: BlobPart = "x"
): File => {
  const file = new File([contents], name, { type })
  Object.defineProperty(file, "size", { value: bytes })
  return file
}

const stubSession = (userId = "ba-user-1") => {
  getSession.mockResolvedValueOnce({
    user: { id: userId, email: "u@e.co" },
  })
}

type StubUser = {
  id: string
  name?: string
  avatar?: string | { id: string } | null
}

const stubUserLookup = (
  docs: ReadonlyArray<StubUser> = [{ id: "payload-user-1" }]
) => {
  find.mockResolvedValueOnce({ docs })
}

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    create.mockReset()
    deleteFn.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(new FormData())
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects missing files", async () => {
    stubSession()
    stubUserLookup()
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(new FormData())
    expect(result.status).toBe("error")
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects files over 5 MB", async () => {
    stubSession()
    stubUserLookup()
    const formData = new FormData()
    formData.set("avatar", makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "Avatar must be under 5 MB.",
    })
  })

  it("rejects disallowed mime types", async () => {
    stubSession()
    stubUserLookup()
    const formData = new FormData()
    formData.set("avatar", makeFile("evil.gif", "image/gif", 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "Avatar must be a JPEG, PNG, or WebP image.",
    })
  })

  it("returns error when the user record is missing", async () => {
    stubSession()
    stubUserLookup([])
    const formData = new FormData()
    formData.set("avatar", makeFile("a.jpg", "image/jpeg", 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
  })

  it("creates a media doc and links it to the user", async () => {
    stubSession()
    stubUserLookup([{ id: "payload-user-1", name: "Ada" }])
    create.mockResolvedValueOnce({
      id: "media-1",
      url: "https://cdn.example/avatar.jpg",
    })
    update.mockResolvedValueOnce({})

    const formData = new FormData()
    formData.set("avatar", makeFile("a.jpg", "image/jpeg", 1024))

    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "media",
        data: { alt: "Ada profile photo" },
        file: expect.objectContaining({
          mimetype: "image/jpeg",
          name: "a.jpg",
          size: 1024,
        }),
        overrideAccess: true,
      })
    )
    expect(update).toHaveBeenCalledWith({
      collection: "users",
      id: "payload-user-1",
      data: { avatar: "media-1" },
      overrideAccess: true,
    })
    expect(deleteFn).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: "success",
      data: {
        mediaId: "media-1",
        url: "https://cdn.example/avatar.jpg",
      },
    })
  })

  it("deletes the previous media doc when replacing an avatar", async () => {
    stubSession()
    stubUserLookup([{ id: "payload-user-1", avatar: { id: "media-old" } }])
    create.mockResolvedValueOnce({
      id: "media-new",
      url: "https://cdn.example/new.jpg",
    })
    update.mockResolvedValueOnce({})
    deleteFn.mockResolvedValueOnce({})

    const formData = new FormData()
    formData.set("avatar", makeFile("a.jpg", "image/jpeg", 1024))

    const { uploadAvatar } = await import("./avatar")
    await uploadAvatar(formData)

    expect(deleteFn).toHaveBeenCalledWith({
      collection: "media",
      id: "media-old",
      overrideAccess: true,
    })
  })
})

describe("removeAvatar", () => {
  beforeEach(() => {
    vi.resetModules()
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    deleteFn.mockReset()
    payloadAuth.mockReset()
    payloadAuth.mockResolvedValue({ user: null })
  })

  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(deleteFn).not.toHaveBeenCalled()
  })

  it("clears the relationship and deletes the media doc", async () => {
    stubSession()
    stubUserLookup([{ id: "payload-user-1", avatar: { id: "media-1" } }])
    update.mockResolvedValueOnce({})
    deleteFn.mockResolvedValueOnce({})

    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()

    expect(update).toHaveBeenCalledWith({
      collection: "users",
      id: "payload-user-1",
      data: { avatar: null },
      overrideAccess: true,
    })
    expect(deleteFn).toHaveBeenCalledWith({
      collection: "media",
      id: "media-1",
      overrideAccess: true,
    })
    expect(result).toEqual({ status: "success", data: undefined })
  })

  it("clears the relationship even when no avatar was set", async () => {
    stubSession()
    stubUserLookup([{ id: "payload-user-1" }])
    update.mockResolvedValueOnce({})

    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()

    expect(update).toHaveBeenCalled()
    expect(deleteFn).not.toHaveBeenCalled()
    expect(result).toEqual({ status: "success", data: undefined })
  })
})
