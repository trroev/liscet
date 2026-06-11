// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { CheckSlugAvailabilityResult } from "../../lib/types"
import { OnboardingFormView } from "./onboarding-form.view"

const DISCLAIMER_RE = /responsible for verifying compliance/i

afterEach(() => {
  cleanup()
})

const availableSlug = (): Promise<CheckSlugAvailabilityResult> =>
  Promise.resolve({ data: { available: true }, status: "success" })

describe("OnboardingFormView", () => {
  it("renders the disclaimer on the first step", () => {
    renderWithProviders(
      <OnboardingFormView
        onCheckSlug={availableSlug}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText(DISCLAIMER_RE)).toBeInTheDocument()
  })

  it("normalizes the typed slug and previews the URL", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <OnboardingFormView
        onCheckSlug={availableSlug}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    const input = screen.getByLabelText("Account URL")
    await user.type(input, "Trevor Mathiak")
    expect(input).toHaveValue("trevor-mathiak")
    expect(screen.getByText("liscet.com/trevor-mathiak")).toBeInTheDocument()
  })

  it("pre-fills the slug from initialSlug and confirms availability", async () => {
    renderWithProviders(
      <OnboardingFormView
        initialSlug="trevor-mathiak"
        onCheckSlug={availableSlug}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Account URL")).toHaveValue("trevor-mathiak")
    await waitFor(() =>
      expect(screen.getByText("Available.")).toBeInTheDocument()
    )
  })

  it("gates Continue on slug availability and advances to the license step", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <OnboardingFormView
        onCheckSlug={availableSlug}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    await user.type(screen.getByLabelText("Account URL"), "trevor-mathiak")
    const continueButton = screen.getByRole("button", { name: "Continue" })
    expect(continueButton).toBeDisabled()

    await waitFor(() =>
      expect(screen.getByText("Available.")).toBeInTheDocument()
    )
    expect(continueButton).toBeEnabled()

    await user.click(continueButton)
    expect(screen.getByLabelText("State and license type")).toBeInTheDocument()
  })

  it("can navigate back from the license step to the URL step", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <OnboardingFormView
        initialSlug="trevor-mathiak"
        onCheckSlug={availableSlug}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    await waitFor(() =>
      expect(screen.getByText("Available.")).toBeInTheDocument()
    )
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.getByLabelText("State and license type")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByLabelText("Account URL")).toBeInTheDocument()
  })
})
