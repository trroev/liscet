// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { TermlyEmbed } from "./termly-embed"

const FALLBACK_RE = /published before launch/i

afterEach(() => {
  cleanup()
})

describe("TermlyEmbed", () => {
  it("renders the Termly embed container with the supplied data-id", () => {
    const { container } = renderWithProviders(
      <TermlyEmbed dataId="policy-123" />
    )

    const embed = container.querySelector('[name="termly-embed"]')
    expect(embed).not.toBeNull()
    expect(embed).toHaveAttribute("data-id", "policy-123")
  })

  it("renders a fallback notice when no data-id is configured", () => {
    const { container } = renderWithProviders(<TermlyEmbed />)

    expect(container.querySelector('[name="termly-embed"]')).toBeNull()
    expect(screen.getByText(FALLBACK_RE)).toBeInTheDocument()
  })
})
