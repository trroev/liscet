import type React from "react"

export type SettingsRowProps = {
  children: React.ReactNode
  description?: string
  label: string
}

export const SettingsRow = ({
  children,
  description,
  label,
}: SettingsRowProps) => (
  <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="space-y-0.5">
      <p className="text-body-sm text-text-primary">{label}</p>
      {description ? (
        <p className="text-body-sm text-text-muted">{description}</p>
      ) : null}
    </div>
    <div className="flex shrink-0 items-center text-body-sm text-text-secondary">
      {children}
    </div>
  </div>
)
