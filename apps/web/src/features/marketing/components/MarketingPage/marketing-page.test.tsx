// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MarketingPage } from "./marketing-page"

afterEach(() => {
  cleanup()
})

describe("MarketingPage", () => {
  it("renders the title as a level-1 heading and its children", () => {
    renderWithProviders(
      <MarketingPage title="About Liscet">
        <p>Placeholder body copy.</p>
      </MarketingPage>
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "About Liscet" })
    ).toBeInTheDocument()
    expect(screen.getByText("Placeholder body copy.")).toBeInTheDocument()
  })
})
