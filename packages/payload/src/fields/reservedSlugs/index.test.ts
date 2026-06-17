import type { TextFieldSingleValidation } from "payload"
import { describe, expect, it } from "vitest"
import {
  createSlugValidator,
  isReservedSlug,
  isReservedUserSlug,
} from "./index"

type ValidateArgs = Parameters<TextFieldSingleValidation>
const run = (
  validate: TextFieldSingleValidation,
  value: string | null | undefined
) => validate(value, {} as ValidateArgs[1])

describe("isReservedSlug", () => {
  it("flags app-route namespaces but not marketing-page slugs", () => {
    expect(isReservedSlug("admin")).toBe(true)
    expect(isReservedSlug("posts")).toBe(true)
    expect(isReservedSlug("about")).toBe(false)
    expect(isReservedSlug("my-page")).toBe(false)
  })
})

describe("isReservedUserSlug", () => {
  it("also flags the literal marketing-route slugs", () => {
    expect(isReservedUserSlug("admin")).toBe(true)
    expect(isReservedUserSlug("about")).toBe(true)
    expect(isReservedUserSlug("pricing")).toBe(true)
    expect(isReservedUserSlug("contact")).toBe(true)
    expect(isReservedUserSlug("my-page")).toBe(false)
  })
})

describe("createSlugValidator", () => {
  const validate = createSlugValidator({ isReserved: isReservedSlug })

  it("treats empty values as valid (handled by `required`)", () => {
    expect(run(validate, undefined)).toBe(true)
    expect(run(validate, null)).toBe(true)
    expect(run(validate, "")).toBe(true)
  })

  it("rejects values that are too short or too long", () => {
    expect(run(validate, "a")).toContain("characters")
    expect(run(validate, "a".repeat(41))).toContain("characters")
  })

  it("rejects non-kebab-case formatting", () => {
    expect(run(validate, "About")).toContain("lowercase")
    expect(run(validate, "a--b")).toContain("lowercase")
  })

  it("rejects reserved slugs via the supplied predicate", () => {
    expect(run(validate, "admin")).toContain("reserved")
    const userValidate = createSlugValidator({ isReserved: isReservedUserSlug })
    expect(run(userValidate, "about")).toContain("reserved")
  })

  it("accepts a well-formed, non-reserved slug", () => {
    expect(run(validate, "about")).toBe(true)
    expect(run(validate, "my-page")).toBe(true)
  })
})
