import { axe } from "jest-axe"
import { expect } from "vitest"

type AxeOptions = Parameters<typeof axe>[1]

export const expectNoAxeViolations = async (
  container: Element,
  options?: AxeOptions
) => {
  const results = await axe(container, options)
  expect(results.violations).toEqual([])
}
