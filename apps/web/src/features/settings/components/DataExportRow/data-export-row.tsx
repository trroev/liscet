"use client"

import { Button } from "@repo/ui/components/Button"
import { toast } from "@repo/ui/components/Toast"
import { useState, useTransition } from "react"
import { match } from "ts-pattern"
import { requestDataExport } from "../../actions/request-data-export"
import { SettingsRow } from "../SettingsRow"

type RequestState = { kind: "idle" } | { kind: "error"; message: string }

export const DataExportRow = () => {
  const [isPending, startTransition] = useTransition()
  const [requestState, setRequestState] = useState<RequestState>({
    kind: "idle",
  })

  const handleRequest = (): void => {
    startTransition(async () => {
      const result = await requestDataExport()
      setRequestState(
        match<typeof result, RequestState>(result)
          .with({ status: "error" }, ({ message }) => ({
            kind: "error",
            message,
          }))
          .with({ status: "success" }, () => {
            toast.success("Export on its way", {
              description:
                "We emailed you a download link — it expires in 24 hours.",
            })
            return { kind: "idle" }
          })
          .exhaustive()
      )
    })
  }

  return (
    <div className="space-y-2">
      <SettingsRow
        description="Download a JSON file of your profile, licenses, courses, and credits."
        label="Export my data"
      >
        <Button disabled={isPending} onClick={handleRequest} variant="outline">
          {isPending ? "Preparing export…" : "Export data"}
        </Button>
      </SettingsRow>
      {requestState.kind === "error" && (
        <p
          aria-live="polite"
          className="pb-4 text-body-sm text-destructive"
          role="alert"
        >
          {requestState.message}
        </p>
      )}
    </div>
  )
}
