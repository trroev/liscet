"use client"

import { Separator as BaseSeparator } from "@base-ui/react/separator"
import { cn } from "@repo/ui/utils/cn"
import type React from "react"

export type SeparatorProps = React.ComponentProps<typeof BaseSeparator>

export const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) => (
  <BaseSeparator
    className={cn(
      "shrink-0 bg-border",
      "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
      "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
      className
    )}
    data-slot="separator"
    orientation={orientation}
    {...props}
  />
)
