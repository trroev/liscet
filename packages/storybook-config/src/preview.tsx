import { type Decorator, definePreview } from "@storybook/nextjs-vite"

import "@repo/tailwind"

const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals.backgrounds?.value === "dark"
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = isDark ? "dark" : "light"
  }
  return (
    <div className="font-sans">
      <Story />
    </div>
  )
}

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
    backgrounds: {
      options: {
        light: { name: "Light", value: "var(--color-background)" },
        dark: { name: "Dark", value: "var(--color-background)" },
      },
    },
    a11y: { test: "todo" },
  },
  initialGlobals: {
    backgrounds: { value: "light" },
  },
  decorators: [withTheme],
})
