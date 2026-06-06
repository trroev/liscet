import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

export class PostsListPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto("/posts")
    await expect(
      this.page.getByRole("heading", { name: "Posts", level: 1 })
    ).toBeVisible()
  }

  async openPost(title: string): Promise<void> {
    await this.page.getByRole("link", { name: title }).click()
  }
}
