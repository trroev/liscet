import path from "node:path"
import { fileURLToPath } from "node:url"
import { sharedConfig } from "@repo/testing/vitest.shared"
import react from "@vitejs/plugin-react"
import { mergeConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default mergeConfig(sharedConfig, {
  plugins: [react()],
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["@repo/testing/msw/setup"],
  },
})
