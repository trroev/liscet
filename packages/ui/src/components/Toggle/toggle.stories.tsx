import { preview } from "@repo/storybook-config/preview"

import { Toggle as Component } from "./toggle"

const meta = preview.meta({
  args: { children: "Toggle" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "icon"],
    },
    render: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Toggle",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Component>Off</Component>
      <Component defaultPressed>On</Component>
      <Component disabled>Disabled</Component>
      <Component defaultPressed disabled>
        Disabled pressed
      </Component>
    </div>
  ),
})
