import { type Decorator, definePreview } from "@storybook/nextjs-vite"

import "@repo/tailwind"

const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals.theme === "dark"
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark)
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
        light: { name: "Light", value: "var(--color-background, #ffffff)" },
        dark: { name: "Dark", value: "var(--color-background, #0b0b0b)" },
      },
    },
    a11y: { test: "todo" },
  },
  initialGlobals: {
    backgrounds: { value: "light" },
  },
  globalTypes: {
    theme: {
      description: "Theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
})
