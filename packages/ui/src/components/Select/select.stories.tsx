import { preview } from "@repo/storybook-config/preview"
import { action } from "storybook/actions"

import { Select as Component } from "./select"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
]

const meta = preview.meta({
  args: {
    options: COURSE_OPTIONS,
    placeholder: "Choose a course",
    onValueChange: action("onValueChange"),
  },
  argTypes: {
    options: { table: { disable: true } },
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Molecules/Select",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Component options={COURSE_OPTIONS} placeholder="Default" />
      <Component defaultValue="main" options={COURSE_OPTIONS} />
      <Component disabled options={COURSE_OPTIONS} placeholder="Disabled" />
      <Component
        error="Required"
        id="s-err"
        options={COURSE_OPTIONS}
        placeholder="Error"
      />
    </div>
  ),
})
