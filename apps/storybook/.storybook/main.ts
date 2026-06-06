import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/nextjs-vite"
import tailwindcss from "@tailwindcss/vite"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..", "..", "..")

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    join(repoRoot, "packages/ui/src/**/*.stories.@(ts|tsx)"),
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-designs"],
  typescript: {
    check: false,
  },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), tailwindcss()],
  }),
}

export default config
