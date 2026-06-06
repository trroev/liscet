import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const skeleton = tv({
  base: "block animate-pulse rounded-sm bg-surface",
  variants: {
    variant: {
      block: "h-24 w-full",
      text: "h-4 w-full last:w-3/4",
    },
  },
  defaultVariants: {
    variant: "block",
  },
})

export type SkeletonVariants = VariantProps<typeof skeleton>
