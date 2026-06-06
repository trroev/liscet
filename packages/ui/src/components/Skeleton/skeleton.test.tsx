import { Skeleton } from "@repo/ui/components/Skeleton"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Skeleton", () => {
  it("exposes aria-busy for assistive tech", () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute("aria-busy", "true")
  })

  it("has no axe violations", async () => {
    const { container } = render(<Skeleton />)
    await expectNoAxeViolations(container)
  })
})
