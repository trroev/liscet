import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const dialogPopup = tv({
  base: [
    "fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
    "space-y-2 rounded-lg border border-border bg-surface p-6 shadow-lg",
    "focus:outline-none",
    "data-ending-style:opacity-0 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-starting-style:scale-95",
    "transition-[opacity,transform] duration-200",
  ],
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type DialogPopupVariants = VariantProps<typeof dialogPopup>
