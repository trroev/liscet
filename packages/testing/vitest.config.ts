import react from "@vitejs/plugin-react"
import { mergeConfig } from "vitest/config"
import { sharedConfig } from "./vitest.shared"

export default mergeConfig(sharedConfig, {
  plugins: [react()],
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
  },
})
