"use client"

import { Button } from "@repo/ui/components/Button"
import { toast } from "@repo/ui/components/Toast"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { match } from "ts-pattern"
import { cancelAccountDeletion } from "../../actions/cancel-account-deletion"
import { getScheduledHardDeleteDate } from "../../lib/deletion-schedule"
import { formatLongDate } from "../../lib/format-long-date"

export type DeletionBannerProps = {
  deletedAt: Date
}

export const DeletionBanner = ({ deletedAt }: DeletionBannerProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | undefined>()

  const scheduledFor = getScheduledHardDeleteDate({ deletedAt })

  const handleCancel = (): void => {
    setServerError(undefined)
    startTransition(async () => {
      const result = await cancelAccountDeletion()
      match(result)
        .with({ status: "error" }, ({ message }) => {
          setServerError(message)
        })
        .with({ status: "success" }, () => {
          router.refresh()
          toast.success("Account deletion cancelled", {
            description: "Your account is active again.",
          })
        })
        .exhaustive()
    })
  }

  return (
    <div
      className="space-y-3 rounded-lg border border-destructive bg-surface p-4"
      role="alert"
    >
      <div className="space-y-1">
        <p className="text-body-sm text-destructive">
          Your account is scheduled for permanent deletion on{" "}
          {formatLongDate(scheduledFor)}.
        </p>
        <p className="text-body-sm text-text-secondary">
          All of your licenses, courses, and certificates will be removed. You
          can cancel anytime before then.
        </p>
      </div>
      {serverError && (
        <p aria-live="polite" className="text-body-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button disabled={isPending} onClick={handleCancel} variant="outline">
        {isPending ? "Cancelling…" : "Cancel deletion"}
      </Button>
    </div>
  )
}
