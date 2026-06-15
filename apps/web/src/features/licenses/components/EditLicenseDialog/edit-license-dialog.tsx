"use client"

import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { useState } from "react"
import { formatLicenseLabel } from "../../lib/format"
import type { LicenseView } from "../../lib/types"
import { EditLicenseForm } from "./edit-license-form"

export type EditLicenseDialogProps = {
  license: LicenseView
}

export const EditLicenseDialog = ({
  license,
}: EditLicenseDialogProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog.Root onOpenChange={setIsOpen} open={isOpen}>
      <Dialog.Trigger
        render={
          <Button size="sm" variant="outline">
            Edit
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Edit license</Dialog.Title>
          <Dialog.Description>
            Update the expiration date and renewal cycle for{" "}
            {formatLicenseLabel(license)}. Saving re-evaluates your logged
            courses against this license.
          </Dialog.Description>
          {isOpen ? (
            <EditLicenseForm
              license={license}
              onSaved={() => setIsOpen(false)}
            />
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
