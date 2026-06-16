// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@repo/env/blob", () => ({
  env: { BLOB_READ_WRITE_TOKEN: "test-token" },
}))

const { del } = vi.hoisted(() => ({
  del: vi.fn<(...args: Array<unknown>) => Promise<void>>(),
}))
vi.mock("@vercel/blob", () => ({ del }))

import { deleteMediaBlob } from "./index"

type HookArg = Parameters<typeof deleteMediaBlob>[0]

const makeArg = (media: unknown): HookArg =>
  ({
    id: "media-1",
    req: { payload: { findByID: vi.fn(async () => media) } },
  }) as unknown as HookArg

describe("deleteMediaBlob", () => {
  beforeEach(() => {
    del.mockReset()
    del.mockResolvedValue(undefined)
  })

  it("deletes the private blob when the doc has a blobPathname", async () => {
    await deleteMediaBlob(makeArg({ blobPathname: "media/cert-abc.pdf" }))
    expect(del).toHaveBeenCalledWith("media/cert-abc.pdf", {
      token: "test-token",
    })
  })

  it("is a no-op for media without a blobPathname", async () => {
    await deleteMediaBlob(makeArg({ blobPathname: null }))
    expect(del).not.toHaveBeenCalled()
  })

  it("swallows delete failures so the doc still deletes", async () => {
    del.mockRejectedValueOnce(new Error("blob gone"))
    await expect(
      deleteMediaBlob(makeArg({ blobPathname: "media/cert-abc.pdf" }))
    ).resolves.toBeUndefined()
    expect(del).toHaveBeenCalledOnce()
  })
})
