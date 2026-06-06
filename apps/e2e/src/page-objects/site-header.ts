import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

const SIGN_IN_LINK = /sign in/i

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
}
