import { fileIntake } from "~/lib/file-intake"

export const CERTIFICATE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024

export const certificateFileSchema = fileIntake({
  maxBytes: CERTIFICATE_MAX_BYTES,
  mimeTypes: CERTIFICATE_MIME_TYPES,
  label: "certificate",
})
