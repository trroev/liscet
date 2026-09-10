import { describe, expect, it } from "vitest"
import { buildPractitionerSyncData } from "./build-practitioner-sync-data"

const email = "ada@example.com"

describe("buildPractitionerSyncData", () => {
  it("should carry the OAuth image through as imageUrl when present", () => {
    const data = buildPractitionerSyncData({
      user: {
        name: "Ada Lovelace",
        email,
        image: "https://lh3.googleusercontent.com/a/ada",
      },
    })

    expect(data).toEqual({
      displayName: "Ada Lovelace",
      email,
      imageUrl: "https://lh3.googleusercontent.com/a/ada",
    })
  })

  it("should omit imageUrl when image is not part of the sync", () => {
    const data = buildPractitionerSyncData({
      user: { name: "Grace Hopper", email },
    })

    expect(data).toEqual({ displayName: "Grace Hopper", email })
    expect(data).not.toHaveProperty("imageUrl")
  })

  it("should write null when the OAuth image was cleared", () => {
    const data = buildPractitionerSyncData({
      user: { name: "Alan Turing", email, image: null },
    })

    expect(data.imageUrl).toBeNull()
  })

  it("should normalise an empty image string to null", () => {
    const data = buildPractitionerSyncData({
      user: { name: "Alan Turing", email, image: "" },
    })

    expect(data.imageUrl).toBeNull()
  })

  it("should fall back to an empty displayName when the user has no name", () => {
    const data = buildPractitionerSyncData({ user: { name: null, email } })

    expect(data.displayName).toBe("")
  })
})
