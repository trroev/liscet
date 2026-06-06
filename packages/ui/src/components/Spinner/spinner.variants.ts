import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const spinner = tv({
  base: "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type SpinnerVariants = VariantProps<typeof spinner>
