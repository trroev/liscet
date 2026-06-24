"use client"

import { useTheme } from "next-themes"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      className="toaster group"
      offset={{ bottom: "5rem", right: "1rem" }}
      position="bottom-right"
      richColors
      style={
        {
          "--normal-bg": "var(--semantic-surface)",
          "--normal-text": "var(--semantic-text-primary)",
          "--normal-border": "var(--semantic-border)",
          "--success-bg": "var(--semantic-surface)",
          "--success-text": "var(--semantic-text-primary)",
          "--success-border": "var(--semantic-success)",
          "--error-bg": "var(--semantic-surface)",
          "--error-text": "var(--semantic-text-primary)",
          "--error-border": "var(--semantic-destructive)",
          "--info-bg": "var(--semantic-surface)",
          "--info-text": "var(--semantic-text-primary)",
          "--info-border": "var(--semantic-info)",
          "--warning-bg": "var(--semantic-surface)",
          "--warning-text": "var(--semantic-text-primary)",
          "--warning-border": "var(--semantic-warning)",
        } as CSSProperties
      }
      theme={resolvedTheme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast: "font-sans rounded-lg shadow-lg",
          title: "font-display font-medium",
          description: "text-body-sm text-text-secondary",
        },
      }}
      {...props}
    />
  )
}
