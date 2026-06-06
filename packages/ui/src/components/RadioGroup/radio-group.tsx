"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group"
import { cn } from "@repo/ui/utils/cn"
import type { ReactNode } from "react"

export type RadioOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type RadioGroupProps = Omit<
  React.ComponentProps<typeof BaseRadioGroup>,
  "value" | "defaultValue" | "onValueChange"
> & {
  options: ReadonlyArray<RadioOption>
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  itemClassName?: string
}

export const RadioGroup = ({
  className,
  itemClassName,
  options,
  value,
  defaultValue,
  onValueChange,
  ...props
}: RadioGroupProps) => (
  <BaseRadioGroup
    className={cn("flex flex-col gap-2", className)}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    value={value}
    {...props}
  >
    {options.map((option) => (
      // biome-ignore lint/a11y/noLabelWithoutControl: wraps a Base UI Radio which renders a hidden input
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 font-sans text-body text-text-primary",
          "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
          itemClassName
        )}
        key={option.value}
      >
        <Radio.Root
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-checked:border-accent",
            "data-disabled:cursor-not-allowed"
          )}
          disabled={option.disabled}
          value={option.value}
        >
          <Radio.Indicator className="size-2.5 rounded-full bg-accent data-unchecked:hidden" />
        </Radio.Root>
        <span>{option.label}</span>
      </label>
    ))}
  </BaseRadioGroup>
)
