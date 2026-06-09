import { describe, expect, it } from "vitest"
import { validateCoTelehealthRegistration } from "./validate-co-telehealth-registration"

// The validate fn only reads `value` and `options.data.state`; other options
// fields are irrelevant, so a minimal cast keeps the tests focused.
const options = (state?: string) =>
  ({ data: state === undefined ? undefined : { state } }) as never

describe("validateCoTelehealthRegistration", () => {
  it("rejects registration when the license is itself a CO license", () => {
    expect(validateCoTelehealthRegistration(true, options("CO"))).toBe(
      "A CO license cannot also be registered for telehealth into Colorado."
    )
  })

  it("allows registration on a home-state (non-CO) license", () => {
    expect(validateCoTelehealthRegistration(true, options("CA"))).toBe(true)
  })

  it("allows an unchecked flag regardless of state", () => {
    expect(validateCoTelehealthRegistration(false, options("CO"))).toBe(true)
    expect(validateCoTelehealthRegistration(undefined, options("CO"))).toBe(
      true
    )
  })

  it("allows when document data is absent", () => {
    expect(validateCoTelehealthRegistration(true, options())).toBe(true)
  })
})
