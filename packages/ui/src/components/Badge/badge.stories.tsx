import { preview } from "@repo/storybook-config/preview"

import { Badge as Component } from "./badge"

const meta = preview.meta({
  args: { children: "Badge" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "default",
        "muted",
        "success",
        "warning",
        "info",
        "destructive",
      ],
    },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Badge",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Component>Default</Component>
      <Component variant="muted">Muted</Component>
      <Component variant="success">Success</Component>
      <Component variant="warning">Warning</Component>
      <Component variant="info">Info</Component>
      <Component variant="destructive">Destructive</Component>
    </div>
  ),
})
