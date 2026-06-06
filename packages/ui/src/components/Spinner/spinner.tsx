import { cn } from "@repo/ui/utils/cn"
import { type SpinnerVariants, spinner } from "./spinner.variants"

export type SpinnerProps = React.ComponentProps<"span"> &
  SpinnerVariants & {
    label?: string
  }

export const Spinner = ({
  className,
  size,
  label = "Loading",
  ref,
  ...props
}: SpinnerProps) => (
  <span
    aria-label={label}
    className={cn("text-accent", className)}
    ref={ref}
    role="status"
    {...props}
  >
    <span aria-hidden="true" className={spinner({ size })} />
    <span className="sr-only">{label}</span>
  </span>
)
