"use client"

import { RiChat2Line } from "@remixicon/react"
import { createLogger } from "@repo/logger"
import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { Textarea } from "@repo/ui/components/Textarea"
import { toast } from "@repo/ui/components/Toast"
import { usePostHog } from "posthog-js/react"
import type { FormEvent, ReactNode } from "react"
import { useState } from "react"

const log = createLogger({ name: "feedback-button" })

export const FeedbackButton = (): ReactNode => {
  const posthog = usePostHog()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) {
      return
    }
    try {
      posthog.capture("feedback submitted", { feedback: trimmed })
    } catch (error) {
      log.withError(error).error("failed to capture feedback")
      toast.error("Couldn't send feedback", {
        description: "Something went wrong. Please try again.",
      })
      return
    }
    toast.success("Feedback sent", {
      description: "Thanks – your note went straight to the team.",
    })
    setMessage("")
    setIsOpen(false)
  }

  return (
    <Dialog.Root onOpenChange={setIsOpen} open={isOpen}>
      <Dialog.Trigger
        render={
          <Button
            aria-label="Send feedback"
            className="fixed right-4 bottom-4 z-40 size-12 rounded-full p-0 md:h-10 md:w-auto md:rounded-md md:px-4"
            type="button"
          >
            <RiChat2Line aria-hidden className="size-5 md:size-4" />
            <span className="hidden md:inline">Feedback</span>
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Share feedback</Dialog.Title>
          <Dialog.Description>
            Tell us what's working and what isn't. Your note goes straight to
            the team.
          </Dialog.Description>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Textarea
              aria-label="Feedback"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What's on your mind?"
              required
              rows={5}
              value={message}
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
