import { defineConfig } from "vitest/config"

export const sharedConfig = defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
    // Vite reserves BASE_URL as its public base path and injects "/" into
    // process.env whenever a Vitest config loads. "/" is not a valid URL, so
    // any module reading BASE_URL through `@repo/env/app` (required URL) or
    // `@repo/env/fetch` (optional URL) throws `Invalid environment variables`
    // at module-eval time under test. Override with a valid placeholder URL
    // here so every package inherits the fix via mergeConfig; it satisfies
    // both slices and mirrors real runtime more closely than a blank value.
    // Packages may still override test.env.BASE_URL locally when a test
    // specifically exercises base-URL behavior.
    env: { BASE_URL: "http://localhost:3000" } satisfies Record<string, string>,
  },
})
