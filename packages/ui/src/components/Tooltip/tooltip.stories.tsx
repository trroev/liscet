import { preview } from "@repo/storybook-config/preview"
import { Button } from "@repo/ui/components/Button"
import type { Decorator } from "@storybook/nextjs-vite"

import { Tooltip as Component, TooltipProvider } from "./tooltip"

const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
)

const meta = preview.meta({
  decorators: [withTooltipProvider],
  parameters: { layout: "centered" },
  title: "Molecules/Tooltip",
})

export const Default = meta.story({
  render: () => (
    <Component content="Tooltip content">
      <Button variant="outline">Hover me</Button>
    </Component>
  ),
})

export const Showcase = meta.story({
  render: () => (
    <div className="flex gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Component content={`On ${side}`} key={side} side={side}>
          <Button variant="outline">{side}</Button>
        </Component>
      ))}
    </div>
  ),
})
