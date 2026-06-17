import { z } from "zod"

export type FileIntakeConfig = {
  readonly maxBytes: number
  readonly mimeTypes: ReadonlyArray<string>
  readonly label: string
}

const MIME_LABELS = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
} as const satisfies Record<string, string>

const describeMimeType = (mimeType: string): string => {
  if (mimeType in MIME_LABELS) {
    return MIME_LABELS[mimeType as keyof typeof MIME_LABELS]
  }
  const [, subtype] = mimeType.split("/")
  return (subtype ?? mimeType).toUpperCase()
}

const formatList = (items: ReadonlyArray<string>): string => {
  if (items.length <= 1) {
    return items[0] ?? ""
  }
  if (items.length === 2) {
    return `${items[0]} or ${items[1]}`
  }
  return `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`
}

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const fileIntake = ({
  maxBytes,
  mimeTypes,
  label,
}: FileIntakeConfig): z.ZodType<File> => {
  const allowed: ReadonlyArray<string> = mimeTypes
  const isAllowedMimeType = (value: string): boolean => allowed.includes(value)

  const subject = capitalize(label)
  const maxMegabytes = maxBytes / (1024 * 1024)
  const noun = mimeTypes.every((mimeType) => mimeType.startsWith("image/"))
    ? "image"
    : "file"
  const typeList = formatList(mimeTypes.map(describeMimeType))

  return z
    .instanceof(File, { message: `Provide a valid ${label} ${noun}.` })
    .refine((file) => file.size > 0, {
      message: `Provide a valid ${label} ${noun}.`,
    })
    .refine((file) => file.size <= maxBytes, {
      message: `${subject} must be under ${maxMegabytes} MB.`,
    })
    .refine((file) => isAllowedMimeType(file.type), {
      message: `${subject} must be a ${typeList} ${noun}.`,
    })
}
