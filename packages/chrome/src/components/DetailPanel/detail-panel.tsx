"use client"

import { cn } from "@repo/ui/utils/cn"
import { useDetailPanel, useDetailPanelContent } from "./detail-panel-context"

export type DetailPanelProps = {
  className?: string
}

export const DetailPanel = ({ className }: DetailPanelProps) => {
  const { isOpen } = useDetailPanel()
  const { content } = useDetailPanelContent()

  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="Details"
      className={cn(
        "shrink-0 overflow-hidden bg-background transition-[width] duration-200",
        "max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-40 max-md:shadow-lg",
        isOpen ? "w-80 max-w-[85vw] border-border border-l" : "w-0",
        className
      )}
    >
      {isOpen ? (
        <div className="h-full w-80 max-w-[85vw] overflow-y-auto p-4">
          {content ?? (
            <p className="text-body-sm text-text-muted">
              Nothing to show here yet.
            </p>
          )}
        </div>
      ) : null}
    </aside>
  )
}
