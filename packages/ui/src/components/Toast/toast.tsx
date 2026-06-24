"use client"

import { useTheme } from "next-themes"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const DURATION_MS = 4000

/*
  A status bar that drains over the toast's lifetime, pausing on hover to
  match sonner's auto-dismiss timer (which also pauses on hover). sonner does
  not expose the remaining time as a CSS variable, so the animation duration
  is matched to the Toaster's configured duration. Error toasts are sticky
  (no finite duration) and get no bar; their status reads from the icon color.
*/
const toastStatusStyles = `
@keyframes toast-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
[data-sonner-toast]:not([data-type="error"]) {
  overflow: hidden;
}
[data-sonner-toast]:not([data-type="error"])::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 3px;
  transform-origin: left;
  background: var(--semantic-accent);
  animation: toast-progress var(--toast-duration, ${DURATION_MS}ms) linear forwards;
}
[data-sonner-toast][data-type="success"]::after { background: var(--semantic-success); }
[data-sonner-toast][data-type="info"]::after { background: var(--semantic-info); }
[data-sonner-toast][data-type="warning"]::after { background: var(--semantic-warning); }
[data-sonner-toaster]:hover [data-sonner-toast]::after {
  animation-play-state: paused;
}
[data-sonner-toast][data-type="success"] [data-icon] { color: var(--semantic-success); }
[data-sonner-toast][data-type="error"] [data-icon] { color: var(--semantic-destructive); }
[data-sonner-toast][data-type="info"] [data-icon] { color: var(--semantic-info); }
[data-sonner-toast][data-type="warning"] [data-icon] { color: var(--semantic-warning); }
[data-sonner-toast][data-type="error"] { border-color: var(--semantic-destructive); }
[data-theme="dark"] [data-sonner-toast]:not([data-type="error"]) { border-color: var(--semantic-border-strong); }
[data-sonner-toaster] [data-sonner-toast][data-styled="true"] [data-description] {
  color: var(--semantic-text-secondary);
}
[data-sonner-toaster] [data-sonner-toast][data-styled="true"] [data-close-button] {
  background: var(--semantic-surface);
  border-color: var(--semantic-border-strong);
  color: var(--semantic-text-secondary);
}
[data-sonner-toaster] [data-sonner-toast][data-styled="true"] [data-close-button]:hover {
  background: var(--semantic-surface-raised);
  color: var(--semantic-text-primary);
}
`

export const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <>
      <style>{toastStatusStyles}</style>
      <Sonner
        className="toaster group"
        duration={DURATION_MS}
        offset={{ bottom: "5rem", right: "1rem" }}
        position="bottom-right"
        style={
          {
            "--normal-bg": "var(--semantic-surface)",
            "--normal-text": "var(--semantic-text-primary)",
            "--normal-border": "var(--semantic-border)",
            "--toast-duration": `${DURATION_MS}ms`,
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
    </>
  )
}
