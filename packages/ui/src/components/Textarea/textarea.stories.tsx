import { preview } from "@repo/storybook-config/preview"

import { Textarea as Component } from "./textarea"

const meta = preview.meta({
  args: { placeholder: "Notes…" },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Textarea",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Component placeholder="Default" />
      <Component defaultValue="Filled" />
      <Component disabled placeholder="Disabled" />
      <Component error="Required" id="t-err" placeholder="With error" />
    </div>
  ),
})
