import type { License } from "@repo/payload/payload-types"
import { match } from "ts-pattern"

const STATE_NAMES = {
  CA: "California",
  CT: "Connecticut",
  MA: "Massachusetts",
  MI: "Michigan",
} as const satisfies Record<string, string>

const MS_PER_DAY = 86_400_000
const DUE_SOON_DAYS = 60

export type StatusBadge = {
  label: string
  variant: "success" | "warning" | "destructive"
}

export type RenewalUrgency = {
  label: string
  variant: "info" | "warning" | "destructive"
}

const stateName = (state: string): string =>
  state in STATE_NAMES ? STATE_NAMES[state as keyof typeof STATE_NAMES] : state

export const formatLicenseLabel = ({
  state,
  licenseType,
}: {
  state: string
  licenseType: string
}): string => `${stateName(state)} — ${licenseType}`

export const formatLicenseDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  })

export const toDateInputValue = (iso: string): string =>
  new Date(iso).toISOString().slice(0, 10)

export const statusBadge = (status: License["status"]): StatusBadge =>
  match(status)
    .with("active", () => ({ label: "Active", variant: "success" }) as const)
    .with("lapsed", () => ({ label: "Lapsed", variant: "warning" }) as const)
    .with(
      "suspended",
      () => ({ label: "Suspended", variant: "warning" }) as const
    )
    .with(
      "revoked",
      () => ({ label: "Revoked", variant: "destructive" }) as const
    )
    .exhaustive()

export const renewalUrgency = (renewsAt: Date, today: Date): RenewalUrgency => {
  const days = Math.floor((renewsAt.getTime() - today.getTime()) / MS_PER_DAY)
  if (days < 0) {
    return { label: "Overdue", variant: "destructive" }
  }
  if (days === 0) {
    return { label: "Due today", variant: "warning" }
  }
  if (days <= DUE_SOON_DAYS) {
    return {
      label: `Due in ${days} ${days === 1 ? "day" : "days"}`,
      variant: "warning",
    }
  }
  return { label: "On track", variant: "info" }
}
