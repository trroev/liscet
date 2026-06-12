import { withThemeByDataAttribute } from "@storybook/addon-themes"
import { type Decorator, definePreview } from "@storybook/nextjs-vite"

import "@repo/tailwind"

const withFontSans: Decorator = (Story) => (
  <div className="font-sans">
    <Story />
  </div>
)

export const preview = definePreview({
  addons: [],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: "todo" },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    withFontSans,
  ],
})
