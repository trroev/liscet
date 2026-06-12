import { tv, type VariantProps } from "@repo/ui/utils/tv"

export const AVATAR_PX = {
  sm: 32,
  md: 48,
  lg: 96,
} as const satisfies Readonly<Record<string, number>>

export type AvatarSize = keyof typeof AVATAR_PX

export const avatar = tv({
  base: [
    "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-accent align-middle text-accent-foreground",
  ],
  variants: {
    size: {
      sm: "size-8 text-body-sm",
      md: "size-12 text-body",
      lg: "size-24 font-display text-heading-md",
    },
    shape: {
      circle: "rounded-full",
      square: "rounded-md",
    },
  },
  defaultVariants: {
    size: "md",
    shape: "circle",
  },
})

export type AvatarVariants = VariantProps<typeof avatar>
