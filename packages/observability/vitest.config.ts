import { defineConfig } from "vitest/config"

// Self-contained rather than extending `@repo/testing/vitest.shared`: that
// package depends on `@repo/auth`, which depends on `@repo/observability`, so
// importing it here would create a workspace dependency cycle. This config only
// needs the Node environment and globals the tests rely on.
export default defineConfig({
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "lcov"],
    },
    environment: "node",
    globals: true,
    passWithNoTests: true,
  },
})
