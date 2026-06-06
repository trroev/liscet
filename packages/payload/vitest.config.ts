import { sharedConfig } from "@repo/testing/vitest.shared"
import react from "@vitejs/plugin-react"
import { mergeConfig } from "vitest/config"

export default mergeConfig(sharedConfig, {
  plugins: [react()],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
})
