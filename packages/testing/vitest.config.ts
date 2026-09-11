import { sharedConfig } from "@repo/vitest-config"
import react from "@vitejs/plugin-react"
import { mergeConfig } from "vitest/config"

export default mergeConfig(sharedConfig, {
  plugins: [react()],
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
  },
})
