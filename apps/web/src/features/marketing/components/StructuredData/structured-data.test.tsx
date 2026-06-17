// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@repo/testing/render"
import { cleanup } from "@testing-library/react"
import type { SoftwareApplication, WithContext } from "schema-dts"
import { afterEach, describe, expect, it } from "vitest"
import { StructuredData } from "./structured-data"

afterEach(() => {
  cleanup()
})

describe("StructuredData", () => {
  it("renders a JSON-LD script whose content matches the item", () => {
    const item: WithContext<SoftwareApplication> = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Liscet",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
    }

    renderWithProviders(<StructuredData<SoftwareApplication> item={item} />)

    const script = document.querySelector('script[type="application/ld+json"]')

    expect(script).not.toBeNull()
    expect(JSON.parse(script?.textContent ?? "{}")).toEqual(item)
  })
})
