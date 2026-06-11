import { RiAlertLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"

export type CategoryProgressRowProps = {
  label: string
  credited: number
  required: number
}

export const CategoryProgressRow = ({
  label,
  credited,
  required,
}: CategoryProgressRowProps): React.JSX.Element => {
  const isMet = credited >= required
  const ratio = required > 0 ? Math.min(credited / required, 1) : 1
  const shortfall = Math.max(required - credited, 0)
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-body-sm text-text-secondary">
          {label}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 font-sans text-body-sm tabular-nums",
            isMet ? "text-text-muted" : "text-warning"
          )}
        >
          {!isMet && <RiAlertLine aria-hidden="true" size={14} />}
          {credited} / {required} hrs
          {!isMet && <span className="sr-only">{shortfall} hours short</span>}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full",
            isMet ? "bg-success" : "bg-accent"
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
