import { expect, test } from "@playwright/test"
import { SiteHeader } from "../page-objects/site-header"

const MARKETING_LINKS = [
  { label: "About", pattern: /\/about$/ },
  { label: "Pricing", pattern: /\/pricing$/ },
  { label: "Contact", pattern: /\/contact$/ },
] as const satisfies ReadonlyArray<{ label: string; pattern: RegExp }>

const MOBILE_VIEWPORT = { width: 390, height: 844 } as const

test.describe("marketing navigation", () => {
  test("navigates to each marketing page from the desktop header", async ({
    page,
  }) => {
    const header = new SiteHeader(page)

    for (const { label, pattern } of MARKETING_LINKS) {
      await page.goto("/")
      await header.clickNavLink(label)
      await expect(page).toHaveURL(pattern)
    }
  })

  test("navigates from the mobile hamburger menu", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    const header = new SiteHeader(page)

    await page.goto("/")
    await header.openMobileMenu()
    await header.clickNavLink("About")

    await expect(page).toHaveURL(MARKETING_LINKS[0].pattern)
  })
})
