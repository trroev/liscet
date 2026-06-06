"use client"

import { Select as BaseSelect } from "@base-ui/react/select"
import { RiArrowDownSLine } from "@remixicon/react"
import { cn } from "@repo/ui/utils/cn"
import type { ReactNode } from "react"

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = React.ComponentProps<typeof BaseSelect.Root> & {
  placeholder?: string
  error?: string
  options: ReadonlyArray<SelectOption>
  className?: string
  id?: string
  triggerClassName?: string
  "aria-label"?: string
}

export const Select = ({
  className,
  triggerClassName,
  placeholder = "Select…",
  error,
  options,
  id,
  "aria-label": ariaLabel,
  ...props
}: SelectProps) => {
  const errorId = error && id ? `${id}-error` : undefined
  return (
    <div className={cn("w-full", className)}>
      <BaseSelect.Root {...props}>
        <BaseSelect.Trigger
          aria-describedby={errorId}
          aria-invalid={error ? "true" : undefined}
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border bg-surface px-3 py-2 font-sans text-body text-text-primary",
            "data-placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-border",
            triggerClassName
          )}
          id={id}
        >
          <BaseSelect.Value>
            {(value: string | null) => {
              if (value == null || value === "") {
                return <span className="text-text-muted">{placeholder}</span>
              }
              return options.find((o) => o.value === value)?.label ?? value
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon className="ml-2 text-text-muted">
            <RiArrowDownSLine aria-hidden="true" size={14} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            className="z-50 outline-none"
            sideOffset={4}
          >
            <BaseSelect.Popup className="max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-md">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {error && (
        <span
          className="mt-1 block font-sans text-body-sm text-destructive"
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}

const SelectItem = ({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) => (
  <BaseSelect.Item
    className={cn(
      "flex cursor-default select-none items-center justify-between px-3 py-2 font-sans text-body text-text-primary outline-none",
      "data-highlighted:bg-background data-highlighted:text-text-primary",
      "data-selected:bg-accent data-selected:text-accent-foreground"
    )}
    value={value}
  >
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
  </BaseSelect.Item>
)
