// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { CategoryProgressRow } from "./category-progress-row"

const HOURS_SHORT_RE = /hours short/

afterEach(() => {
  cleanup()
})

describe("CategoryProgressRow", () => {
  it("shows credited and required hours", () => {
    renderWithProviders(
      <CategoryProgressRow credited={6} label="Law And Ethics" required={6} />
    )
    expect(screen.getByText("Law And Ethics")).toBeInTheDocument()
    expect(screen.getByText("6 / 6 hrs")).toBeInTheDocument()
  })

  it("announces the shortfall when the requirement is not met", () => {
    renderWithProviders(
      <CategoryProgressRow credited={2} label="Clinical" required={6} />
    )
    expect(screen.getByText("4 hours short")).toBeInTheDocument()
  })

  it("does not announce a shortfall when the requirement is met", () => {
    renderWithProviders(
      <CategoryProgressRow credited={8} label="Clinical" required={6} />
    )
    expect(screen.queryByText(HOURS_SHORT_RE)).not.toBeInTheDocument()
  })
})
