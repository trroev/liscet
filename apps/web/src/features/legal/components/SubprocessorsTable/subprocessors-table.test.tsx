// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { SUBPROCESSORS_LAST_UPDATED } from "../../lib/subprocessors"
import { SubprocessorsTable } from "./subprocessors-table"

afterEach(() => {
  cleanup()
})

const REQUIRED_SUBPROCESSORS = [
  "Vercel",
  "Neon",
  "Resend",
  "Sentry",
  "PostHog",
  "Axiom",
] as const

describe("SubprocessorsTable", () => {
  it("lists every required subprocessor", () => {
    renderWithProviders(<SubprocessorsTable />)

    for (const name of REQUIRED_SUBPROCESSORS) {
      expect(screen.getByRole("cell", { name })).toBeInTheDocument()
    }
  })

  it("shows the last-updated date", () => {
    renderWithProviders(<SubprocessorsTable />)

    expect(
      screen.getByText(`Last updated: ${SUBPROCESSORS_LAST_UPDATED}`)
    ).toBeInTheDocument()
  })
})
