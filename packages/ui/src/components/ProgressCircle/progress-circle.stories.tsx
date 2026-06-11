import { preview } from "@repo/storybook-config/preview"

import { ProgressCircle as Component } from "./progress-circle"

const meta = preview.meta({
  args: { label: "CEU progress", size: 24, value: 0.5 },
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/ProgressCircle",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Component label="0%" size={24} value={0} />
      <Component label="25%" size={24} value={0.25} />
      <Component label="50%" size={24} value={0.5} />
      <Component label="75%" size={24} value={0.75} />
      <Component label="Complete" size={24} value={1} />
    </div>
  ),
})
