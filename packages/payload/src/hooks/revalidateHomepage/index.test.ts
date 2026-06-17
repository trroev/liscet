import { describe, expect, it, vi } from "vitest"

const revalidatePath = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: (...args: ReadonlyArray<unknown>) => revalidatePath(...args),
}))

const { revalidateHomepage } = await import("./index")

describe("revalidateHomepage", () => {
  it("revalidates the home route and returns the doc unchanged", () => {
    const doc = { hero: { title: "Hello" } }

    const result = revalidateHomepage({
      doc,
    } as Parameters<typeof revalidateHomepage>[0])

    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(result).toBe(doc)
  })
})
