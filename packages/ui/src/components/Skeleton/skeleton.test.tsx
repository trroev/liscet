import { Skeleton } from "@repo/ui/components/Skeleton"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Skeleton", () => {
  it("exposes aria-busy for assistive tech", () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute("aria-busy", "true")
  })
})
