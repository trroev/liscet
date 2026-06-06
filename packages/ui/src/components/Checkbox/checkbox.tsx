"use client"

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import { RiCheckLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"

export type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <BaseCheckbox.Root
    className={cn(
      "inline-flex size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50",
      "data-checked:border-accent data-checked:bg-accent",
      "data-invalid:border-destructive",
      className
    )}
    {...props}
  >
    <BaseCheckbox.Indicator className="flex text-accent-foreground data-unchecked:hidden">
      <RiCheckLine aria-hidden="true" size={14} />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
)
