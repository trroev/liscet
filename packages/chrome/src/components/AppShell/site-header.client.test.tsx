// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { type MarketingNavLink, SiteHeader } from "./site-header.client"

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const satisfies ReadonlyArray<MarketingNavLink>

describe("SiteHeader", () => {
  it("renders each marketing nav link pointing at its route", () => {
    render(
      <SiteHeader
        authSlot={<span>auth</span>}
        mobileAuthSlot={<span>mobile-auth</span>}
        navLinks={NAV_LINKS}
      />
    )

    for (const link of NAV_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href
      )
    }
  })

  it("renders no marketing links when none are provided", () => {
    render(
      <SiteHeader
        authSlot={<span>auth</span>}
        mobileAuthSlot={<span>mobile-auth</span>}
      />
    )

    expect(screen.queryByRole("link", { name: "About" })).toBeNull()
  })
})
