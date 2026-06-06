import { Spinner } from "@repo/ui/components/Spinner"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Spinner", () => {
  it("exposes role status with an accessible label", () => {
    render(<Spinner label="Saving" />)
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Spinner />)
    await expectNoAxeViolations(container)
  })
})
