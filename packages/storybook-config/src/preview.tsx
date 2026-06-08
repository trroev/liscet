import { type Decorator, definePreview } from "@storybook/nextjs-vite"

import "@repo/tailwind"

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light"
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme
    document.body.style.backgroundColor = "var(--color-background)"
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
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "Theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
      },
    },
  },
  decorators: [withTheme],
})
