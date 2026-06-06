"use client"

import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { cn } from "@repo/ui/utils/cn"
import { type ToggleVariants, toggle } from "./toggle.variants"

export type ToggleProps = React.ComponentProps<typeof BaseToggle> &
  ToggleVariants

export const Toggle = ({ className, variant, size, ...props }: ToggleProps) => (
  <BaseToggle className={cn(toggle({ variant, size }), className)} {...props} />
)
