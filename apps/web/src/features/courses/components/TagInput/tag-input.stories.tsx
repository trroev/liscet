import { preview } from "@repo/storybook-config/preview"
import { useState } from "react"
import { action } from "storybook/actions"
import { TagInput } from "./tag-input"

const meta = preview.meta({
  args: {
    onChange: action("onChange"),
    placeholder: "Add a subject category…",
    value: [],
  },
  component: TagInput,
  parameters: { layout: "centered" },
  title: "Features/Courses/TagInput",
})

export const Empty = meta.story({})

export const WithTags = meta.story({
  args: { value: ["Ethics", "Trauma-informed care", "Telehealth"] },
})

const Interactive = (): React.JSX.Element => {
  const [value, setValue] = useState<Array<string>>(["Ethics"])
  return (
    <div className="w-80">
      <TagInput
        onChange={setValue}
        placeholder="Add a subject category…"
        value={value}
      />
    </div>
  )
}

export const Showcase = meta.story({
  render: () => <Interactive />,
})
