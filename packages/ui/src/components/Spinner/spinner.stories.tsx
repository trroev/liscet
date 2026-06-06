import { preview } from "@repo/storybook-config/preview"

import { Spinner as Component } from "./spinner"

const meta = preview.meta({
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Spinner",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex items-center gap-6">
      <Component size="sm" />
      <Component size="md" />
      <Component size="lg" />
    </div>
  ),
})
