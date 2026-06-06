import { Badge } from "@repo/ui/components/Badge"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>Entrée</Badge>)
    expect(screen.getByText("Entrée")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(<Badge>Entrée</Badge>)
    await expectNoAxeViolations(container)
  })
})
