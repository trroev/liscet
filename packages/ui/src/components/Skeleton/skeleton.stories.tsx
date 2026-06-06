import { preview } from "@repo/storybook-config/preview"

import { Skeleton as Component } from "./skeleton"

const meta = preview.meta({
  argTypes: {
    variant: { control: "inline-radio", options: ["block", "text"] },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Skeleton",
})

export const Default = meta.story({
  render: (args) => (
    <div className="w-80">
      <Component {...args} />
    </div>
  ),
})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Component variant="block" />
      <Component variant="text" />
      <Component variant="text" />
      <Component variant="text" />
    </div>
  ),
})
