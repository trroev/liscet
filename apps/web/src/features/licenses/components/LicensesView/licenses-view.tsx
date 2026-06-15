"use client"

import { useQuery } from "@tanstack/react-query"
import { LICENSES_QUERY_KEY } from "~/lib/query-keys"
import { getLicenses } from "../../actions/get-licenses"
import type { LicensesData } from "../../lib/types"
import { LicenseCard } from "../LicenseCard"

export type LicensesViewProps = {
  initialData: LicensesData
  nowIso: string
}

export const LicensesView = ({
  initialData,
  nowIso,
}: LicensesViewProps): React.JSX.Element => {
  const { data } = useQuery({
    initialData,
    queryFn: getLicenses,
    queryKey: LICENSES_QUERY_KEY,
  })
  const today = new Date(nowIso)

  if (data.licenses.length === 0) {
    return (
      <p className="rounded-lg border border-border border-dashed bg-surface p-6 font-sans text-body-sm text-text-secondary">
        You don&apos;t have any licenses yet.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {data.licenses.map((license) => (
        <LicenseCard key={license.id} license={license} today={today} />
      ))}
    </div>
  )
}
