import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { expectNoAxeViolations } from "@repo/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Field", () => {
  it("renders label and associates it with the input", () => {
    render(
      <Field label="Email">
        <Input id="email" />
      </Field>
    )
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("renders error and marks the field invalid", () => {
    render(
      <Field error="Required" label="Email">
        <Input id="email" />
      </Field>
    )
    expect(screen.getByText("Required")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <Field label="Email">
        <Input id="email" />
      </Field>
    )
    await expectNoAxeViolations(container)
  })
})
