// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const nav = vi.hoisted(() => ({
  selectedSegment: null as string | null,
}))

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => nav.selectedSegment,
}))

import { SettingsNav } from "./settings-nav"

describe("SettingsNav", () => {
  beforeEach(() => {
    nav.selectedSegment = "account"
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders a link per section scoped to the user slug", () => {
    render(<SettingsNav userSlug="test-user" />)

    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/test-user/settings/account"
    )
    expect(screen.getByRole("link", { name: "Preferences" })).toHaveAttribute(
      "href",
      "/test-user/settings/preferences"
    )
  })

  it("marks the active section with aria-current", () => {
    render(<SettingsNav userSlug="test-user" />)

    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      screen.getByRole("link", { name: "Preferences" })
    ).not.toHaveAttribute("aria-current")
  })

  it("highlights the section matching the selected layout segment", () => {
    nav.selectedSegment = "preferences"
    render(<SettingsNav userSlug="test-user" />)

    expect(screen.getByRole("link", { name: "Preferences" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Account" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("exposes a labelled navigation landmark", () => {
    render(<SettingsNav userSlug="test-user" />)

    expect(
      screen.getByRole("navigation", { name: "Settings" })
    ).toBeInTheDocument()
  })
})
