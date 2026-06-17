// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { HeroSection } from "./hero-section"

afterEach(() => {
  cleanup()
})

describe("HeroSection", () => {
  it("renders the title, subtitle, and CTA", () => {
    renderWithProviders(
      <HeroSection
        ctaHref="/sign-up"
        ctaLabel="Start tracking free"
        subtitle="Track your CEUs."
        title="License & CEU Tracker"
      />
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "License & CEU Tracker" })
    ).toBeInTheDocument()
    expect(screen.getByText("Track your CEUs.")).toBeInTheDocument()

    const cta = screen.getByText("Start tracking free").closest("a")
    expect(cta).toHaveAttribute("href", "/sign-up")
  })
})
