import { sharedConfig } from "@repo/vitest-config"
import { mergeConfig } from "vitest/config"

export default mergeConfig(sharedConfig, {
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "lcov"],
    },
  },
})
