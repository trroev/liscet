import { cn } from "@repo/ui/utils/cn"

export type LabelProps = React.ComponentProps<"label">

export const Label = ({ className, ...props }: LabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: consumer wires htmlFor or wraps a control
  <label
    className={cn(
      "font-sans text-body-sm text-text-primary leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50",
      className
    )}
    {...props}
  />
)
