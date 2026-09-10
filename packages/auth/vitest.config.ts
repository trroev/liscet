import { defineConfig } from "vitest/config"

/**
 * Standalone rather than `mergeConfig(sharedConfig, …)`: `@repo/testing`
 * depends on `@repo/auth`, so importing it here would create a workspace
 * dependency cycle. Mirrors the shared defaults, including the `BASE_URL`
 * placeholder that keeps `@repo/env` from rejecting Vite's injected "/".
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
    env: { BASE_URL: "http://localhost:3000" } satisfies Record<string, string>,
  },
})
