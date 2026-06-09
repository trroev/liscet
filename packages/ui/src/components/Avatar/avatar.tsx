"use client"

import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { cn } from "@repo/ui/utils/cn"
import {
  AVATAR_PX,
  type AvatarSize,
  type AvatarVariants,
  avatar,
} from "./avatar.variants"

export type AvatarProps = React.ComponentProps<typeof BaseAvatar.Root> &
  AvatarVariants & {
    src?: string | null
    alt?: string
    initials: string
    transformSrc?: ({ url, px }: { url: string; px: number }) => string
  }

export const Avatar = ({
  className,
  size,
  shape,
  src,
  alt = "",
  initials,
  transformSrc,
  ...props
}: AvatarProps) => {
  const resolvedSize: AvatarSize = size ?? "md"
  const px = AVATAR_PX[resolvedSize]
  const applyTransform = (px: number): string | null => {
    if (!src) {
      return null
    }
    return transformSrc ? transformSrc({ url: src, px }) : src
  }
  const src1x = applyTransform(px)
  const src2x = applyTransform(px * 2)

  return (
    <BaseAvatar.Root
      className={cn(avatar({ size, shape }), className)}
      {...props}
    >
      {src1x && (
        <BaseAvatar.Image
          alt={alt}
          className="size-full object-cover"
          src={src1x}
          {...(src2x ? { srcSet: `${src1x} 1x, ${src2x} 2x` } : {})}
        />
      )}
      <BaseAvatar.Fallback
        aria-hidden="true"
        className="flex size-full items-center justify-center"
      >
        {initials}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
}
