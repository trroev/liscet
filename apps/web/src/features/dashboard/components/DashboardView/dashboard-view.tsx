"use client"

import { Button } from "@repo/ui/components/Button"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getDashboardSummary } from "../../actions/get-dashboard-summary"
import type { DashboardData } from "../../lib/types"
import { LicenseProgressCard } from "../LicenseProgressCard"

export type DashboardViewProps = {
  initialData: DashboardData
  userSlug: string
  nowIso: string
}

export const DASHBOARD_QUERY_KEY = ["dashboard-summary"] as const

export const DashboardView = ({
  initialData,
  userSlug,
  nowIso,
}: DashboardViewProps): React.JSX.Element => {
  const { data } = useQuery({
    initialData,
    queryFn: getDashboardSummary,
    queryKey: DASHBOARD_QUERY_KEY,
  })
  const today = new Date(nowIso)

  if (data.licenses.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-surface p-6">
        <p className="font-sans text-body-sm text-text-secondary">
          You don&apos;t have any active licenses yet.
        </p>
        <Button
          nativeButton={false}
          render={<Link href={`/${userSlug}/licenses`} />}
          size="sm"
        >
          Add a license
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {data.licenses.map((view) => (
        <LicenseProgressCard
          key={view.id}
          today={today}
          userSlug={userSlug}
          view={view}
        />
      ))}
    </div>
  )
}
