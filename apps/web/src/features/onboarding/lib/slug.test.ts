import { describe, expect, it } from "vitest"
import {
  formatSlug,
  isReservedSlug,
  SLUG_MAX_LENGTH,
  validateSlugFormat,
} from "./slug"

describe("formatSlug", () => {
  it("lowercases input", () => {
    expect(formatSlug("Trevor")).toBe("trevor")
  })

  it("replaces whitespace and underscores with single hyphens", () => {
    expect(formatSlug("Trevor   Mathiak")).toBe("trevor-mathiak")
    expect(formatSlug("trevor_mathiak")).toBe("trevor-mathiak")
    expect(formatSlug("trevor _ mathiak")).toBe("trevor-mathiak")
  })

  it("preserves a trailing hyphen during typing (lets the next char start a new word)", () => {
    expect(formatSlug("trevor ")).toBe("trevor-")
    expect(formatSlug("trevor-")).toBe("trevor-")
  })

  it("strips leading hyphens", () => {
    expect(formatSlug("--trevor---mathiak--")).toBe("trevor-mathiak-")
  })

  it("strips disallowed characters", () => {
    expect(formatSlug("trevor.mathiak!")).toBe("trevormathiak")
  })

  it("transliterates unicode characters to ASCII", () => {
    expect(formatSlug("héllo")).toBe("hello")
    expect(formatSlug("José Núñez")).toBe("jose-nunez")
  })

  it(`caps length at ${SLUG_MAX_LENGTH}`, () => {
    const result = formatSlug("a".repeat(SLUG_MAX_LENGTH + 10))
    expect(result.length).toBe(SLUG_MAX_LENGTH)
  })
})

describe("isReservedSlug", () => {
  it("flags reserved words", () => {
    expect(isReservedSlug("admin")).toBe(true)
    expect(isReservedSlug("sign-in")).toBe(true)
    expect(isReservedSlug("settings")).toBe(true)
  })

  it("does not flag arbitrary slugs", () => {
    expect(isReservedSlug("trevor-mathiak")).toBe(false)
  })
})

describe("validateSlugFormat", () => {
  it("accepts valid kebab-case slugs", () => {
    expect(validateSlugFormat("trevor-mathiak")).toBeNull()
    expect(validateSlugFormat("a1")).toBeNull()
  })

  it("rejects too-short slugs", () => {
    expect(validateSlugFormat("a")).toBe("too-short")
  })

  it("rejects too-long slugs", () => {
    expect(validateSlugFormat("a".repeat(SLUG_MAX_LENGTH + 1))).toBe("too-long")
  })

  it("rejects uppercase, special chars, leading/trailing/consecutive hyphens", () => {
    expect(validateSlugFormat("Trevor")).toBe("format")
    expect(validateSlugFormat("trevor!")).toBe("format")
    expect(validateSlugFormat("-trevor")).toBe("format")
    expect(validateSlugFormat("trevor-")).toBe("format")
    expect(validateSlugFormat("trevor--mathiak")).toBe("format")
  })
})
