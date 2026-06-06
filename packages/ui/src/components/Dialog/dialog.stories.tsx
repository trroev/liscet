import { preview } from "@repo/storybook-config/preview"
import { Button } from "@repo/ui/components/Button"

import { Dialog as Component } from "."

const meta = preview.meta({
  parameters: { layout: "fullscreen" },
  title: "Organisms/Dialog",
})

const Template = ({ size = "md" as const }: { size?: "sm" | "md" | "lg" }) => (
  <Component.Root>
    <Component.Trigger render={<Button>Open dialog</Button>} />
    <Component.Portal>
      <Component.Backdrop />
      <Component.Popup size={size}>
        <Component.Title>Confirm action</Component.Title>
        <Component.Description>
          This action cannot be undone. Are you sure you want to continue?
        </Component.Description>
        <div className="mt-6 flex justify-end gap-2">
          <Component.Close render={<Button variant="ghost">Cancel</Button>} />
          <Component.Close
            render={<Button variant="destructive">Confirm</Button>}
          />
        </div>
      </Component.Popup>
    </Component.Portal>
  </Component.Root>
)

export const Default = meta.story({
  render: () => (
    <div className="flex min-h-dvh items-center justify-center">
      <Template />
    </div>
  ),
})

export const Showcase = meta.story({
  render: () => (
    <div className="flex min-h-dvh items-center justify-center gap-3">
      <Template size="sm" />
      <Template size="md" />
      <Template size="lg" />
    </div>
  ),
})
