import { Avatar } from "@repo/ui/components/Avatar"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Avatar", () => {
  it("renders the fallback initials when no src is provided", () => {
    render(<Avatar initials="TM" />)
    expect(screen.getByText("TM")).toBeInTheDocument()
  })

  it("renders the fallback initials when src is provided but not yet loaded", () => {
    render(
      <Avatar
        alt="Trevor"
        initials="TM"
        src="https://res.cloudinary.com/demo/image/upload/sample.jpg"
      />
    )
    expect(screen.getByText("TM")).toBeInTheDocument()
  })

  it("has no axe violations in fallback state", async () => {
    const { container } = render(<Avatar initials="TM" />)
    await expectNoAxeViolations(container)
  })
})
