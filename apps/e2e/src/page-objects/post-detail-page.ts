import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

export class PostDetailPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async expectVisible({
    title,
    sectionHeading,
  }: {
    readonly title: string
    readonly sectionHeading: string
  }): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: title, level: 1 })
    ).toBeVisible()
    await expect(
      this.page.getByRole("heading", { name: sectionHeading, level: 2 })
    ).toBeVisible()
  }
}
