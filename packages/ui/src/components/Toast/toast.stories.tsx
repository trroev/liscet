import { preview } from "@repo/storybook-config/preview"
import { Button } from "@repo/ui/components/Button"

import { Toaster, toast } from "."

const meta = preview.meta({
  parameters: { layout: "fullscreen" },
  title: "Organisms/Toast",
})

const Triggers = () => (
  <div className="flex min-h-dvh items-center justify-center gap-3">
    <Button
      onClick={() =>
        toast.success("Feedback sent", {
          description: "Thanks — your note went straight to the team.",
        })
      }
      type="button"
    >
      Success
    </Button>
    <Button
      onClick={() =>
        toast.error("Something went wrong", {
          description: "We couldn't save your changes. Try again.",
          closeButton: true,
          duration: Number.POSITIVE_INFINITY,
        })
      }
      type="button"
      variant="destructive"
    >
      Error
    </Button>
    <Button
      onClick={() =>
        toast.info("Heads up", {
          description: "Your license renews in 30 days.",
        })
      }
      type="button"
      variant="outline"
    >
      Info
    </Button>
  </div>
)

export const Default = meta.story({
  render: () => (
    <>
      <Toaster />
      <Triggers />
    </>
  ),
})
