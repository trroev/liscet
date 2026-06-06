"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { cn } from "@repo/ui/utils/cn"
import type { ReactNode } from "react"

export type FieldProps = Omit<
  React.ComponentProps<typeof BaseField.Root>,
  "children"
> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export const Field = ({
  className,
  label,
  hint,
  error,
  children,
  invalid,
  ...props
}: FieldProps) => (
  <BaseField.Root
    className={cn("flex flex-col gap-1.5", className)}
    invalid={invalid ?? Boolean(error)}
    {...props}
  >
    {label && (
      <BaseField.Label className="font-sans text-body-sm text-text-primary leading-none data-disabled:cursor-not-allowed data-disabled:opacity-50">
        {label}
      </BaseField.Label>
    )}
    {children}
    {hint && !error && (
      <BaseField.Description className="font-sans text-body-sm text-text-muted">
        {hint}
      </BaseField.Description>
    )}
    {error && (
      <BaseField.Error
        className="font-sans text-body-sm text-destructive"
        match={true}
      >
        {error}
      </BaseField.Error>
    )}
  </BaseField.Root>
)
