import { cn } from "@repo/ui/utils/cn"
import type React from "react"

export type SettingsGroupProps = {
  children: React.ReactNode
  title: string
  tone?: "default" | "destructive"
}

export const SettingsGroup = ({
  children,
  title,
  tone = "default",
}: SettingsGroupProps) => (
  <section className="space-y-2">
    <h2
      className={cn(
        "font-display text-heading-sm",
        tone === "destructive" ? "text-destructive" : "text-text-primary"
      )}
    >
      {title}
    </h2>
    <div
      className={cn(
        "divide-y divide-border rounded-lg border bg-surface px-4",
        tone === "destructive" ? "border-destructive" : "border-border"
      )}
    >
      {children}
    </div>
  </section>
)
