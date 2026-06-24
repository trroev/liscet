// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { render, waitFor } from "@testing-library/react"
import { ThemeProvider } from "next-themes"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeToggle } from "."

const Setup = () => (
  <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
    <ThemeToggle />
  </ThemeProvider>
)

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  })
})

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute("data-theme")
})

describe("ThemeToggle", () => {
  it("reflects the persisted theme on mount", async () => {
    window.localStorage.setItem("theme", "dark")
    render(<Setup />)
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
    })
  })
})
