import { preview } from "@repo/storybook-config/preview"

import { Welcome as Component } from "./welcome"

const meta = preview.meta({
  component: Component,
  parameters: { layout: "fullscreen" },
  title: "Foundations/Welcome",
})

export const Overview = meta.story({})
