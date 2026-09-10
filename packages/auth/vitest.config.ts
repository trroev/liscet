import { defineConfig } from "vitest/config"

/**
 * Standalone rather than `mergeConfig(sharedConfig, …)`: `@repo/testing`
 * depends on `@repo/auth`, so importing it here would create a workspace
 * dependency cycle. Mirrors the shared defaults that apply to this package.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
  },
})
