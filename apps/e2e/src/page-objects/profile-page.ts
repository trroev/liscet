import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

const SIGN_OUT_BUTTON = /sign out/i

export class ProfilePage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto("/profile")
    await expect(
      this.page.getByRole("heading", { name: "Profile", level: 1 })
    ).toBeVisible()
  }

  async expectEmail(email: string): Promise<void> {
    await expect(this.page.getByText(email)).toBeVisible()
  }

  async expectMemberSince(): Promise<void> {
    await expect(this.page.getByText("Member since")).toBeVisible()
  }

  async signOut(): Promise<void> {
    await this.page.getByRole("button", { name: SIGN_OUT_BUTTON }).click()
  }
}
