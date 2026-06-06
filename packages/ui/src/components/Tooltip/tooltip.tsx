"use client"

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { cn } from "@repo/ui/utils/cn"
import type { ReactElement, ReactNode } from "react"

type Side = "top" | "right" | "bottom" | "left"

export type TooltipProps = {
  content: ReactNode
  children: ReactElement
  side?: Side
  sideOffset?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
}

export const Tooltip = ({
  content,
  children,
  side = "top",
  sideOffset = 6,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
}: TooltipProps) => (
  <BaseTooltip.Root
    defaultOpen={defaultOpen}
    disabled={disabled}
    onOpenChange={onOpenChange}
    open={open}
  >
    <BaseTooltip.Trigger render={children} />
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
        <BaseTooltip.Popup
          className={cn(
            "z-50 rounded-md border border-border bg-surface px-2 py-1 font-sans text-body-sm text-text-primary shadow-md",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            "transition-opacity duration-150",
            className
          )}
        >
          {content}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  </BaseTooltip.Root>
)

export const TooltipProvider = BaseTooltip.Provider
export type TooltipProviderProps = React.ComponentProps<
  typeof BaseTooltip.Provider
>
