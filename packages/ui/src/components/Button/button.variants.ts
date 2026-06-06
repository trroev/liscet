import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium font-sans transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
      outline:
        "border border-border bg-transparent text-text-primary hover:bg-surface",
      ghost: "bg-transparent text-text-primary hover:bg-surface",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
    },
    size: {
      sm: "h-8 px-3 text-body-sm",
      md: "h-10 px-4 text-body",
      lg: "h-12 px-6 text-body-lg",
      icon: "size-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export type ButtonVariants = VariantProps<typeof button>
