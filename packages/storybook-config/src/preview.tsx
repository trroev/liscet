import { withThemeByDataAttribute } from "@storybook/addon-themes"
import { definePreview } from "@storybook/nextjs-vite"

import "@repo/tailwind"

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
      themes: { Light: "light", Dark: "dark" },
      defaultTheme: "Light",
      attributeName: "data-theme",
    }),
    (Story) => (
      <div className="font-sans">
        <Story />
      </div>
    ),
  ],
})
