"use client"

import { Button } from "@repo/ui/components/Button"
import { useState, useTransition } from "react"
import { match } from "ts-pattern"
import { getCertificateUrl } from "../../actions/get-certificate-url"

export type CertificateDownloadProps = {
  courseId: string
}

export const CertificateDownload = ({
  courseId,
}: CertificateDownloadProps): React.JSX.Element => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDownload = (): void => {
    setError(null)
    startTransition(async () => {
      const result = await getCertificateUrl(courseId)
      match(result)
        .with({ status: "success" }, ({ data }) => {
          window.open(data.url, "_blank", "noopener,noreferrer")
        })
        .with({ status: "error" }, ({ message }) => {
          setError(message)
        })
        .exhaustive()
    })
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={isPending}
        onClick={handleDownload}
        type="button"
        variant="outline"
      >
        {isPending ? "Preparing…" : "View certificate"}
      </Button>
      {error ? (
        <p
          aria-live="polite"
          className="font-sans text-body-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
