import { describe, expect, it, vi } from "vitest"

const revalidatePath = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: (...args: ReadonlyArray<unknown>) => revalidatePath(...args),
}))

const { revalidatePage } = await import("./index")

describe("revalidatePage", () => {
  it("revalidates every resolved path and returns the doc unchanged", () => {
    const doc = { slug: "about" }
    const hook = revalidatePage<{ slug: string }>({
      resolvePaths: (d) => [`/${d.slug}`, "/sitemap.xml"],
    })

    const result = hook({ doc })

    expect(revalidatePath).toHaveBeenCalledWith("/about")
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml")
    expect(result).toBe(doc)
  })

  it("supports a static path that ignores the doc", () => {
    revalidatePath.mockClear()
    const doc = { hero: { title: "Hello" } }
    const hook = revalidatePage({ resolvePaths: () => ["/"] })

    const result = hook({ doc })

    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(result).toBe(doc)
  })
})
