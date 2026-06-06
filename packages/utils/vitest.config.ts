import { sharedConfig } from "@repo/testing/vitest.shared"
import { mergeConfig } from "vitest/config"

export default mergeConfig(sharedConfig, {
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/index.ts"],
    },
  },
})
