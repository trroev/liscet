import { Label } from "@repo/ui/components/Label"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Label", () => {
  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <input id="name" type="text" />
      </>
    )
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Label htmlFor="x">X</Label>
        <input id="x" type="text" />
      </>
    )
    await expectNoAxeViolations(container)
  })
})
