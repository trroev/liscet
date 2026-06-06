"use client"

import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import { type ToggleVariants, toggle } from "@repo/ui/components/Toggle"
import { cn } from "@repo/ui/utils/cn"

export type ToggleGroupRootProps = React.ComponentProps<typeof BaseToggleGroup>

export const ToggleGroupRoot = ({
  className,
  ...props
}: ToggleGroupRootProps) => (
  <BaseToggleGroup
    className={cn("inline-flex items-center gap-1", className)}
    {...props}
  />
)

export type ToggleGroupItemProps = React.ComponentProps<typeof BaseToggle> &
  ToggleVariants

export const ToggleGroupItem = ({
  className,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) => (
  <BaseToggle className={cn(toggle({ variant, size }), className)} {...props} />
)
