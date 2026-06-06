import { preview } from "@repo/storybook-config/preview"
import { action } from "storybook/actions"

import { RadioGroup as Component } from "./radio-group"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
] as const

const meta = preview.meta({
  args: {
    options: COURSE_OPTIONS,
    defaultValue: "main",
    onValueChange: action("onValueChange"),
  },
  argTypes: {
    options: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Molecules/RadioGroup",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Component defaultValue="main" options={COURSE_OPTIONS} />
      <Component
        defaultValue="main"
        options={[
          ...COURSE_OPTIONS,
          { value: "dis", label: "Disabled", disabled: true },
        ]}
      />
      <Component disabled options={COURSE_OPTIONS} />
    </div>
  ),
})
