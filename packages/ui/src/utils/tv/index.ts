import { twMergeConfig } from "@repo/ui/utils/twMergeConfig"
import { createTV } from "tailwind-variants"

export const tv = createTV({ twMerge: true, twMergeConfig })

export type { VariantProps } from "tailwind-variants"
