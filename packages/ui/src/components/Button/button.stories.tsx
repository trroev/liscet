import { RiArrowRightLine } from "@remixicon/react"
import { preview } from "@repo/storybook-config/preview"
import { action } from "storybook/actions"

import { Button as Component } from "./button"

const meta = preview.meta({
  args: {
    children: "Button",
    onClick: action("onClick"),
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    render: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Button",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="space-y-6">
      {(
        ["primary", "secondary", "outline", "ghost", "destructive"] as const
      ).map((variant) => (
        <div className="flex flex-wrap items-center gap-3" key={variant}>
          <Component size="sm" variant={variant}>
            Small
          </Component>
          <Component size="md" variant={variant}>
            Medium
          </Component>
          <Component size="lg" variant={variant}>
            Large
          </Component>
          <Component size="icon" variant={variant}>
            <RiArrowRightLine aria-hidden="true" size={16} />
          </Component>
          <Component disabled variant={variant}>
            Disabled
          </Component>
        </div>
      ))}
    </div>
  ),
})
