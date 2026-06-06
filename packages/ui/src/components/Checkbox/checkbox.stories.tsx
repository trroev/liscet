import { preview } from "@repo/storybook-config/preview"
import { Label } from "@repo/ui/components/Label"

import { Checkbox as Component } from "./checkbox"

const meta = preview.meta({
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Checkbox",
})

export const Default = meta.story({})

type RowProps = {
  id: string
  label: string
  defaultChecked?: boolean
  disabled?: boolean
}

const Row = ({ id, label, defaultChecked, disabled }: RowProps) => (
  <div className="flex items-center gap-2">
    <Component defaultChecked={defaultChecked} disabled={disabled} id={id} />
    <Label htmlFor={id}>{label}</Label>
  </div>
)

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <Row id="cb-default" label="Default" />
      <Row defaultChecked id="cb-checked" label="Checked" />
      <Row disabled id="cb-disabled" label="Disabled" />
      <Row
        defaultChecked
        disabled
        id="cb-disabled-checked"
        label="Disabled checked"
      />
    </div>
  ),
})
