import { describe, expect, it } from "vitest"
import { getPageItems } from "./pagination.helpers"

describe("getPageItems", () => {
  it("lists every page without ellipsis when total is 7 or fewer", () => {
    expect(getPageItems({ current: 4, total: 7 })).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ])
    expect(getPageItems({ current: 1, total: 1 })).toEqual([1])
  })

  it("windows around the current page with ellipses on both sides", () => {
    expect(getPageItems({ current: 5, total: 10 })).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ])
  })

  it("omits the leading ellipsis near the start", () => {
    expect(getPageItems({ current: 2, total: 10 })).toEqual([
      1,
      2,
      3,
      "ellipsis",
      10,
    ])
  })

  it("omits the trailing ellipsis near the end", () => {
    expect(getPageItems({ current: 10, total: 10 })).toEqual([
      1,
      "ellipsis",
      9,
      10,
    ])
  })
})
