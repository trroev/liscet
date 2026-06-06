import { twMergeConfig } from "@repo/ui/utils/twMergeConfig"
import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge(twMergeConfig)

export const cn = (...inputs: Array<ClassValue>): string =>
  twMerge(clsx(inputs))
