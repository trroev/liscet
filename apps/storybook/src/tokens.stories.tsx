import { preview } from "@repo/storybook-config/preview"

import { Tokens as Component } from "./tokens"

const meta = preview.meta({
  component: Component,
  parameters: { layout: "fullscreen" },
  title: "Foundations/Tokens",
})

export const Reference = meta.story({})
