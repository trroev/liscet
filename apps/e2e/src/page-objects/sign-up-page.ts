import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

const CREATE_ACCOUNT_BUTTON = /create account/i

export type SignUpCredentials = {
  readonly name: string
  readonly email: string
  readonly password: string
}

export class SignUpPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(): Promise<void> {
    await this.page.goto("/sign-up")
    await expect(
      this.page.getByRole("button", { name: CREATE_ACCOUNT_BUTTON })
    ).toBeVisible()
  }

  async signUp({ name, email, password }: SignUpCredentials): Promise<void> {
    await this.page.getByLabel("Name").fill(name)
    await this.page.getByLabel("Email").fill(email)
    await this.page.getByLabel("Password", { exact: true }).fill(password)
    await this.page.getByLabel("Confirm password").fill(password)
    await this.page.getByRole("button", { name: CREATE_ACCOUNT_BUTTON }).click()
  }
}
