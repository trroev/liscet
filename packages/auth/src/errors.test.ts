import { describe, expect, it } from "vitest"
import {
  createFriendlyMessageLookup,
  friendlyAuthMessage,
  friendlyOAuthErrorMessage,
  GENERIC_AUTH_ERROR_MESSAGE,
} from "./errors"

/**
 * Widens a literal to `string` so the lookup takes its runtime-code path
 * instead of tripping the compile-time check for misspelled literals.
 */
const asRuntimeCode = (code: string): string => code

describe("createFriendlyMessageLookup", () => {
  const lookup = createFriendlyMessageLookup({
    messages: { known: "Known copy." },
    fallback: "Default copy.",
  })

  it("returns the mapped copy for a known code", () => {
    expect(lookup({ code: "known" })).toBe("Known copy.")
  })

  it("returns the builder fallback for unknown or missing codes", () => {
    const unknownCode = asRuntimeCode("nope")
    expect(lookup({ code: unknownCode })).toBe("Default copy.")
    expect(lookup({ code: undefined })).toBe("Default copy.")
  })

  it("prefers a per-call fallback over the builder fallback", () => {
    const unknownCode = asRuntimeCode("nope")
    expect(lookup({ code: unknownCode, fallback: "Call copy." })).toBe(
      "Call copy."
    )
  })

  it("ignores inherited object keys", () => {
    const prototypeKey = asRuntimeCode("constructor")
    expect(lookup({ code: prototypeKey })).toBe("Default copy.")
  })

  it("rejects a misspelled literal code at compile time", () => {
    // @ts-expect-error - "knwon" is not a key of the message map.
    expect(lookup({ code: "knwon" })).toBe("Default copy.")
  })
})

describe("friendlyAuthMessage", () => {
  it("maps better-auth API codes to friendly copy", () => {
    expect(friendlyAuthMessage({ code: "USER_NOT_FOUND" })).toBe(
      "No account found for that email."
    )
  })

  it("falls back to the server message, then the generic copy", () => {
    const unknownCode = asRuntimeCode("SOMETHING_ELSE")
    expect(
      friendlyAuthMessage({ code: unknownCode, fallback: "Server said no." })
    ).toBe("Server said no.")
    expect(friendlyAuthMessage({ code: undefined })).toBe(
      GENERIC_AUTH_ERROR_MESSAGE
    )
  })
})

describe("friendlyOAuthErrorMessage", () => {
  it("maps OAuth callback codes to friendly copy", () => {
    expect(friendlyOAuthErrorMessage({ code: "access_denied" })).toBe(
      "Sign-in was cancelled before finishing."
    )
  })

  it("falls back to the generic copy for unknown codes", () => {
    const unknownCode = asRuntimeCode("mystery")
    expect(friendlyOAuthErrorMessage({ code: unknownCode })).toBe(
      GENERIC_AUTH_ERROR_MESSAGE
    )
  })
})
