import { randomBytes } from "node:crypto"
import { expect, test } from "@playwright/test"
import { ProfilePage } from "../page-objects/profile-page"
import { SignUpPage } from "../page-objects/sign-up-page"
import { SiteHeader } from "../page-objects/site-header"

const SIGN_OUT_BUTTON = /sign out/i

const uniqueEmail = (): string =>
  `e2e-${Date.now()}-${randomBytes(3).toString("hex")}@example.test`

test("auth lifecycle: sign-up, profile, sign-out", async ({ page }) => {
  const email = uniqueEmail()
  const password = "Passw0rd!Passw0rd"
  const name = "E2E User"

  const signUp = new SignUpPage(page)
  await signUp.goto()
  await signUp.signUp({ name, email, password })

  await page.waitForURL("/")

  const profile = new ProfilePage(page)
  await profile.goto()
  await profile.expectEmail(email)
  await profile.expectMemberSince()

  await profile.signOut()
  await page.waitForURL("/")

  const header = new SiteHeader(page)
  await header.expectSignedOut()
  await expect(page.getByRole("button", { name: SIGN_OUT_BUTTON })).toHaveCount(
    0
  )
})
