"use client"

import { scopeSentry } from "@repo/observability"
import { useEffect } from "react"

type SentryUserProps = {
  /** Canonical practitioner id, resolved server-side; `null` when signed out. */
  practitionerId: string | null
}

export const SentryUser = ({ practitionerId }: SentryUserProps): null => {
  useEffect(() => {
    scopeSentry({ practitionerId })
  }, [practitionerId])
  return null
}
