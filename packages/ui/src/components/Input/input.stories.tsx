import { preview } from "@repo/storybook-config/preview"

import { Input as Component } from "./input"

const meta = preview.meta({
  args: { placeholder: "Enter text…" },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Input",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Component placeholder="Default" />
      <Component defaultValue="Filled" />
      <Component disabled placeholder="Disabled" />
      <Component error="Required" id="err" placeholder="With error" />
    </div>
  ),
})
