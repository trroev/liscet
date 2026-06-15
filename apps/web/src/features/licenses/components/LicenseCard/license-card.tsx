import { Badge } from "@repo/ui/components/Badge"
import {
  formatLicenseDate,
  formatLicenseLabel,
  renewalUrgency,
  statusBadge,
} from "../../lib/format"
import type { LicenseView } from "../../lib/types"
import { EditLicenseDialog } from "../EditLicenseDialog"

export type LicenseCardProps = {
  license: LicenseView
  today: Date
}

type DetailProps = {
  label: string
  value: string
}

const Detail = ({ label, value }: DetailProps): React.JSX.Element => (
  <div className="space-y-1">
    <dt className="font-sans text-body-sm text-text-muted">{label}</dt>
    <dd className="font-sans text-body text-text-primary tabular-nums">
      {value}
    </dd>
  </div>
)

export const LicenseCard = ({
  license,
  today,
}: LicenseCardProps): React.JSX.Element => {
  const status = statusBadge(license.status)
  const urgency = renewalUrgency(new Date(license.expiresAt), today)

  return (
    <section className="space-y-5 rounded-lg border border-border bg-surface p-5 sm:p-6">
      <header className="flex flex-wrap-reverse items-end justify-between gap-x-4 gap-y-2">
        <div className="space-y-1">
          <h2 className="font-display text-heading-md text-text-primary">
            {formatLicenseLabel(license)}
          </h2>
          <p className="font-sans text-body-sm text-text-muted">
            License #{license.licenseNumber}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </header>

      <dl className="grid grid-cols-2 gap-4">
        <Detail
          label="Issue date"
          value={formatLicenseDate(license.issuedAt)}
        />
        <Detail
          label="Renewal date"
          value={formatLicenseDate(license.expiresAt)}
        />
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={urgency.variant}>{urgency.label}</Badge>
        <EditLicenseDialog license={license} />
      </div>
    </section>
  )
}
