import { button } from "@repo/ui/components/Button"
import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const toggle = tv({
  extend: button,
  base: [
    "data-pressed:bg-accent data-pressed:text-accent-foreground",
    "data-pressed:border-accent",
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
})

export type ToggleVariants = VariantProps<typeof toggle>
