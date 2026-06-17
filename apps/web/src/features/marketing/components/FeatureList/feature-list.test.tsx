// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { type Feature, FeatureList } from "./feature-list"

const FEATURES = [
  { title: "First feature", description: "Does the first thing." },
  { title: "Second feature", description: "Does the second thing." },
] as const satisfies ReadonlyArray<Feature>

afterEach(() => {
  cleanup()
})

describe("FeatureList", () => {
  it("renders the heading and one entry per feature", () => {
    renderWithProviders(
      <FeatureList features={FEATURES} heading="Why Liscet" />
    )

    expect(
      screen.getByRole("heading", { level: 2, name: "Why Liscet" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("Does the first thing.")).toBeInTheDocument()
    expect(screen.getByText("Does the second thing.")).toBeInTheDocument()
  })
})
