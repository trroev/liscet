import { describe, expect, it } from "vitest"
import { buildPractitionerSyncData } from "./build-practitioner-sync-data"

describe("buildPractitionerSyncData", () => {
  it("carries the OAuth image through as imageUrl when present", () => {
    const data = buildPractitionerSyncData({
      user: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        image: "https://lh3.googleusercontent.com/a/ada",
      },
    })

    expect(data).toEqual({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      imageUrl: "https://lh3.googleusercontent.com/a/ada",
    })
  })

  it("omits imageUrl entirely when the user has no image", () => {
    const data = buildPractitionerSyncData({
      user: { name: "Grace Hopper", email: "grace@example.com" },
    })

    expect(data).toEqual({
      displayName: "Grace Hopper",
      email: "grace@example.com",
    })
    expect(data).not.toHaveProperty("imageUrl")
  })

  it("treats a null or empty image as absent rather than writing an empty value", () => {
    const fromNull = buildPractitionerSyncData({
      user: { name: "Alan Turing", email: "alan@example.com", image: null },
    })
    const fromEmpty = buildPractitionerSyncData({
      user: { name: "Alan Turing", email: "alan@example.com", image: "" },
    })

    expect(fromNull).not.toHaveProperty("imageUrl")
    expect(fromEmpty).not.toHaveProperty("imageUrl")
  })

  it("falls back to an empty displayName when the user has no name", () => {
    const data = buildPractitionerSyncData({
      user: { name: null, email: "noname@example.com" },
    })

    expect(data.displayName).toBe("")
  })
})
