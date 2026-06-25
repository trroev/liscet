import { fileIntake } from "~/lib/file-intake"

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const avatarFileSchema = fileIntake({
  maxBytes: AVATAR_MAX_BYTES,
  mimeTypes: AVATAR_MIME_TYPES,
  label: "avatar",
})
