const STATE_NAMES = {
  CA: "California",
  CT: "Connecticut",
  MA: "Massachusetts",
  MI: "Michigan",
} as const satisfies Record<string, string>

const MS_PER_DAY = 86_400_000
const DUE_SOON_DAYS = 60

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

export const formatCategoryLabel = (category: string): string =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

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
