"use client"

import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HARD_DELETE_AFTER_DAYS } from "../../lib/deletion-schedule"
import { DeleteAccountForm } from "./delete-account-form"

export const DeleteAccountDialog = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleDeleted = (): void => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <Dialog.Root onOpenChange={setIsOpen} open={isOpen}>
      <Dialog.Trigger
        render={<Button variant="destructive">Delete account</Button>}
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Delete account</Dialog.Title>
          <Dialog.Description>
            Your account and all of its data will be permanently deleted{" "}
            {HARD_DELETE_AFTER_DAYS} days from now. You can cancel anytime
            before then. Confirm your password to continue.
          </Dialog.Description>
          {isOpen ? <DeleteAccountForm onDeleted={handleDeleted} /> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
