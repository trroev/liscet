import { cn } from "@repo/ui/utils/cn"
import { type SkeletonVariants, skeleton } from "./skeleton.variants"

export type SkeletonProps = React.ComponentProps<"span"> & SkeletonVariants

export const Skeleton = ({ className, variant, ...props }: SkeletonProps) => (
  <span
    aria-busy="true"
    aria-live="polite"
    className={cn(skeleton({ variant }), className)}
    {...props}
  />
)
