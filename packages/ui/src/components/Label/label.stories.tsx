import { preview } from "@repo/storybook-config/preview"
import { Input } from "@repo/ui/components/Input"

import { Label as Component } from "./label"

const meta = preview.meta({
  args: { children: "Label" },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Label",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Component htmlFor="email">Email</Component>
      <Input id="email" placeholder="you@example.com" />
    </div>
  ),
})
