import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

const CONTINUE_BUTTON = /continue/i
const FINISH_BUTTON = /finish/i
const LICENSE_SELECT_LABEL = "State + license type"

export type OnboardingDetails = {
  readonly slug: string
  readonly licenseOptionLabel: string
  readonly licenseNumber: string
  readonly issuedAt: string
  readonly expiresAt: string
}

export class OnboardingPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async completeOnboarding({
    slug,
    licenseOptionLabel,
    licenseNumber,
    issuedAt,
    expiresAt,
  }: OnboardingDetails): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: "Choose your URL" })
    ).toBeVisible()
    await this.page.getByLabel("Account URL").fill(slug)
    await expect(this.page.getByText("Available.")).toBeVisible()
    await this.page.getByRole("button", { name: CONTINUE_BUTTON }).click()

    await this.page
      .getByRole("combobox", { name: LICENSE_SELECT_LABEL })
      .click()
    await this.page.getByRole("option", { name: licenseOptionLabel }).click()
    await this.page.getByRole("button", { name: CONTINUE_BUTTON }).click()

    await this.page.getByLabel("License number").fill(licenseNumber)
    await this.page.getByLabel("Issue date").fill(issuedAt)
    await this.page.getByLabel("Expiration date").fill(expiresAt)
    await this.page.getByRole("button", { name: FINISH_BUTTON }).click()
  }
}
