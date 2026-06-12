import { RiCheckLine } from "@remixicon/react"
import { Badge } from "@repo/ui/components/Badge"
import { Button } from "@repo/ui/components/Button"
import { ProgressCircle } from "@repo/ui/components/ProgressCircle"
import { Separator } from "@repo/ui/components/Separator"
import Link from "next/link"
import {
  formatCategoryLabel,
  formatLicenseLabel,
  renewalUrgency,
} from "../../lib/format"
import type { LicenseSummaryView } from "../../lib/types"
import { CategoryProgressRow } from "../CategoryProgressRow"

export type LicenseProgressCardProps = {
  view: LicenseSummaryView
  userSlug: string
  today: Date
}

const Panel = ({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element => (
  <section className="space-y-5 rounded-lg border border-border bg-surface p-5 sm:p-6">
    {children}
  </section>
)

export const LicenseProgressCard = ({
  view,
  userSlug,
  today,
}: LicenseProgressCardProps): React.JSX.Element => {
  const title = formatLicenseLabel(view)

  if (view.summary === null) {
    return (
      <Panel>
        <header className="space-y-1">
          <h2 className="font-display text-heading-md text-text-primary">
            {title}
          </h2>
          <p className="font-sans text-body-sm text-text-muted">
            License #{view.licenseNumber}
          </p>
        </header>
        <p className="font-sans text-body-sm text-text-muted">
          Progress tracking for this license isn&apos;t available yet.
        </p>
      </Panel>
    )
  }

  const summary = view.summary
  const renewsAt = new Date(summary.renewsAt)
  const urgency = renewalUrgency(renewsAt, today)
  const ratio =
    summary.requiredHours > 0
      ? summary.totalCreditedHours / summary.requiredHours
      : 1
  const hasCredits = summary.totalCreditedHours > 0
  const minHoursConstraints = summary.formatConstraintProgress.filter(
    (constraint) => constraint.kind === "min-hours"
  )

  return (
    <Panel>
      {/* wrap-reverse stacks the wrapped badge above the title; it also flips
          the cross axis, so items-end renders as top-aligned */}
      <header className="flex flex-wrap-reverse items-end justify-between gap-x-4 gap-y-2">
        <div className="space-y-1">
          <h2 className="font-display text-heading-md text-text-primary">
            {title}
          </h2>
          <p className="font-sans text-body-sm text-text-muted">
            License #{view.licenseNumber}
          </p>
        </div>
        <Badge variant={summary.isComplete ? "success" : "muted"}>
          {summary.isComplete && (
            <RiCheckLine aria-hidden="true" className="mr-1" size={12} />
          )}
          {summary.isComplete ? "Complete" : "In progress"}
        </Badge>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ProgressCircle
            isComplete={summary.isComplete}
            label={`${title} overall completion`}
            size={32}
            value={ratio}
          />
          <div>
            <p className="font-sans text-body text-text-primary tabular-nums">
              {summary.totalCreditedHours} / {summary.requiredHours} hrs
            </p>
            <p className="font-sans text-body-sm text-text-muted">
              Renews {renewsAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant={urgency.variant}>{urgency.label}</Badge>
      </div>

      {hasCredits ? (
        <>
          <Separator />
          <div className="space-y-4">
            {summary.categoryProgress.map((category) => (
              <CategoryProgressRow
                credited={category.credited}
                key={category.category}
                label={formatCategoryLabel(category.category)}
                required={category.required}
              />
            ))}
          </div>

          {summary.specialRequirementProgress.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-sans text-body-sm text-text-secondary uppercase tracking-wide">
                Special requirements
              </h3>
              {summary.specialRequirementProgress.map((requirement) => (
                <CategoryProgressRow
                  credited={requirement.credited}
                  key={requirement.category}
                  label={formatCategoryLabel(requirement.category)}
                  required={requirement.required}
                />
              ))}
            </div>
          )}

          {minHoursConstraints.length > 0 && (
            <div className="space-y-4">
              {minHoursConstraints.map((constraint) => (
                <CategoryProgressRow
                  credited={constraint.creditedHours}
                  key={`min-${constraint.limitHours}`}
                  label="Minimum format hours"
                  required={constraint.limitHours}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="font-sans text-body-sm text-text-secondary">
              No courses logged yet. Log your first course to start tracking
              progress toward this license&apos;s requirements.
            </p>
            <Button
              render={<Link href={`/${userSlug}/courses/new`} />}
              size="sm"
            >
              Log your first course
            </Button>
          </div>
        </>
      )}
    </Panel>
  )
}
