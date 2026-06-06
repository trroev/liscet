import { preview } from "@repo/storybook-config/preview"
import { Input } from "@repo/ui/components/Input"

import { Field as Component } from "./field"

const meta = preview.meta({
  args: {
    label: "Email",
    children: <Input id="email" placeholder="you@example.com" />,
  },
  argTypes: {
    children: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Molecules/Field",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Component label="Email">
        <Input id="f1" placeholder="you@example.com" />
      </Component>
      <Component hint="We never share your email." label="Email">
        <Input id="f2" placeholder="you@example.com" />
      </Component>
      <Component error="Required" label="Email">
        <Input id="f3" placeholder="you@example.com" />
      </Component>
      <Component disabled label="Email">
        <Input disabled id="f4" placeholder="you@example.com" />
      </Component>
    </div>
  ),
})
