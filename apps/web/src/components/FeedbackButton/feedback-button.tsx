"use client"

import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { Textarea } from "@repo/ui/components/Textarea"
import { usePostHog } from "posthog-js/react"
import type { FormEvent, ReactNode } from "react"
import { useState } from "react"

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
    posthog.capture("survey sent", { $survey_response: trimmed })
    setMessage("")
    setIsOpen(false)
  }

  return (
    <Dialog.Root onOpenChange={setIsOpen} open={isOpen}>
      <Dialog.Trigger
        render={
          <Button className="fixed right-4 bottom-4 z-40" type="button">
            Feedback
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
