"use client"

import type React from "react"
import { useEffect } from "react"
import { useDetailPanelContent } from "./detail-panel-context"

export type DetailPanelContentProps = {
  children: React.ReactNode
}

/**
 * Registers contextual content for the shell's right detail panel. Render it
 * anywhere inside a screen — the children appear in the panel region rather
 * than in place, and are cleared when the screen unmounts.
 */
export const DetailPanelContent = ({ children }: DetailPanelContentProps) => {
  const { setContent } = useDetailPanelContent()

  useEffect(() => {
    setContent(children)
    return () => setContent(null)
  }, [children, setContent])

  return null
}
