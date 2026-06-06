import { preview } from "@repo/storybook-config/preview"

import { ToggleGroup as Component } from "."

const meta = preview.meta({
  parameters: { layout: "centered" },
  title: "Molecules/ToggleGroup",
})

const Demo = () => (
  <Component.Root defaultValue={["us"]}>
    <Component.Item value="us">US</Component.Item>
    <Component.Item value="metric">Metric</Component.Item>
  </Component.Root>
)

export const Default = meta.story({ render: () => <Demo /> })
export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <Demo />
      <Component.Root defaultValue={["main"]}>
        <Component.Item value="starter">Starter</Component.Item>
        <Component.Item value="main">Main</Component.Item>
        <Component.Item disabled value="dessert">
          Dessert
        </Component.Item>
      </Component.Root>
    </div>
  ),
})
