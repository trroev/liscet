import type { Locator, Page } from "@playwright/test"
import { expect } from "@playwright/test"

const SIGN_IN_LINK = /sign in/i
const OPEN_MOBILE_MENU = /open navigation menu/i

export class SiteHeader {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async expectSignedOut(): Promise<void> {
    await expect(
      this.page.getByRole("link", { name: SIGN_IN_LINK }).first()
    ).toBeVisible()
  }

  /**
   * The currently visible marketing nav link with the given label. The desktop
   * row and the mobile popup render the same links, so filtering by visibility
   * resolves to whichever viewport's copy is on screen.
   */
  navLink(label: string): Locator {
    return this.page
      .getByRole("link", { name: label })
      .filter({ visible: true })
  }

  async clickNavLink(label: string): Promise<void> {
    await this.navLink(label).click()
  }

  async openMobileMenu(): Promise<void> {
    await this.page.getByRole("button", { name: OPEN_MOBILE_MENU }).click()
  }
}
