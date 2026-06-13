// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { TagInput } from "./tag-input"

afterEach(() => {
  cleanup()
})

const Harness = ({
  initial = [],
}: {
  initial?: Array<string>
}): React.JSX.Element => {
  const [value, setValue] = useState<Array<string>>(initial)
  return (
    <TagInput
      aria-label="Tags"
      onChange={setValue}
      placeholder="Add a tag…"
      value={value}
    />
  )
}

describe("TagInput", () => {
  it("adds a chip on Enter", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.type(screen.getByLabelText("Tags"), "Ethics{Enter}")

    expect(screen.getByText("Ethics")).toBeInTheDocument()
  })

  it("ignores empty and duplicate entries", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness initial={["Ethics"]} />)
    const input = screen.getByLabelText("Tags")

    await user.type(input, "{Enter}")
    await user.type(input, "Ethics{Enter}")

    expect(screen.getAllByText("Ethics")).toHaveLength(1)
  })

  it("removes a chip via its remove button", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness initial={["Ethics"]} />)

    await user.click(screen.getByRole("button", { name: "Remove Ethics" }))

    expect(screen.queryByText("Ethics")).not.toBeInTheDocument()
  })
})
