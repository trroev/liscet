import { preview } from "@repo/storybook-config/preview"
import { Label } from "@repo/ui/components/Label"

import { Switch as Component } from "./switch"

const meta = preview.meta({
  component: Component,
  parameters: { layout: "centered" },
  title: "Atoms/Switch",
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
      <Row id="sw-off" label="Off" />
      <Row defaultChecked id="sw-on" label="On" />
      <Row disabled id="sw-disabled" label="Disabled" />
      <Row defaultChecked disabled id="sw-disabled-on" label="Disabled on" />
    </div>
  ),
})
