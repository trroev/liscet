import { randomBytes } from "node:crypto"
import { expect, test } from "@playwright/test"
import { OnboardingPage } from "../page-objects/onboarding-page"
import { SettingsPage } from "../page-objects/settings-page"
import { SignUpPage } from "../page-objects/sign-up-page"
import { SiteHeader } from "../page-objects/site-header"

const SIGN_OUT_BUTTON = /sign out/i
const LICENSE_OPTION_LABEL = "California — LCSW"

const uniqueEmail = (): string =>
  `e2e-${Date.now()}-${randomBytes(3).toString("hex")}@example.test`

const uniqueSlug = (): string => `e2e-user-${randomBytes(3).toString("hex")}`

const isoDate = (date: Date): string => date.toISOString().slice(0, 10)

test("auth lifecycle: sign-up, onboarding, account settings, sign-out", async ({
  page,
}) => {
  const email = uniqueEmail()
  const password = "Passw0rd!Passw0rd"
  const name = "E2E User"

  const signUp = new SignUpPage(page)
  await signUp.goto()
  await signUp.signUp({ name, email, password })

  await page.waitForURL("/onboarding")

  const slug = uniqueSlug()
  const now = new Date()
  const onboarding = new OnboardingPage(page)
  await onboarding.completeOnboarding({
    expiresAt: isoDate(
      new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    ),
    issuedAt: isoDate(
      new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    ),
    licenseNumber: "LCSW-12345",
    licenseOptionLabel: LICENSE_OPTION_LABEL,
    slug,
  })

  await page.waitForURL(`/${slug}`)
  await expect(
    page.getByRole("heading", { name: LICENSE_OPTION_LABEL })
  ).toBeVisible()

  await page.goto("/profile")
  await page.waitForURL(`/${slug}/settings/account`)

  const settings = new SettingsPage(page)
  await settings.gotoAccount(slug)
  await settings.expectEmail(email)
  await settings.expectMemberSince()

  await settings.signOut()
  await page.waitForURL("/")

  const header = new SiteHeader(page)
  await header.expectSignedOut()
  await expect(page.getByRole("button", { name: SIGN_OUT_BUTTON })).toHaveCount(
    0
  )
})
