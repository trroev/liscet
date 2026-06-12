"use client"

import { RiLayoutRightLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"
import { useDetailPanel } from "./detail-panel-context"

export type DetailPanelTriggerProps = {
  className?: string
}

export const DetailPanelTrigger = ({ className }: DetailPanelTriggerProps) => {
  const { isOpen, toggle } = useDetailPanel()

  return (
    <button
      aria-expanded={isOpen}
      aria-keyshortcuts="Meta+I"
      aria-label={isOpen ? "Close detail panel" : "Open detail panel"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-text-secondary",
        "hover:bg-surface hover:text-text-primary",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        className
      )}
      onClick={toggle}
      type="button"
    >
      <RiLayoutRightLine aria-hidden className="size-4" />
    </button>
  )
}
