"use server"

import "server-only"

import { scanUploadedFile } from "@repo/payload/hooks/virusScan"
import { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { uploadCertificateBlob } from "../lib/certificate-blob"
import { logCourseSchema } from "../lib/schema"
import type { LogCourseResult } from "../lib/types"

const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024

// Allowlist is defense-in-depth alongside the virus scan run before upload.
const ALLOWED_CERTIFICATE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

type AllowedCertificateMimeType =
  (typeof ALLOWED_CERTIFICATE_MIME_TYPES)[number]

const isAllowedMimeType = (
  value: string
): value is AllowedCertificateMimeType =>
  (ALLOWED_CERTIFICATE_MIME_TYPES as ReadonlyArray<string>).includes(value)

const certificateFileSchema = z
  .instanceof(File, { message: "Upload a PDF or image certificate." })
  .refine((file) => file.size <= MAX_CERTIFICATE_BYTES, {
    message: "Certificate must be under 10 MB.",
  })
  .refine((file) => isAllowedMimeType(file.type), {
    message: "Certificate must be a PDF, JPEG, PNG, or WebP file.",
  })

export const logCourse = authedAction<FormData, LogCourseResult>(
  async ({ user, payload, input: formData }) => {
    const providerEntry = formData.get("provider")
    const parsed = logCourseSchema.safeParse({
      completedAt: formData.get("completedAt"),
      format: formData.get("format"),
      hours: formData.get("hours"),
      provider: providerEntry ? String(providerEntry) : "",
      subjectCategories: formData.getAll("subjectCategories").map(String),
      title: formData.get("title"),
    })
    if (!parsed.success) {
      return {
        status: "error",
        message:
          parsed.error.issues[0]?.message ?? "Check the form for errors.",
      }
    }
    const values = parsed.data

    let certificateId: string | undefined
    const certificateEntry = formData.get("certificate")
    if (certificateEntry instanceof File && certificateEntry.size > 0) {
      const parsedFile = certificateFileSchema.safeParse(certificateEntry)
      if (!parsedFile.success) {
        return {
          status: "error",
          message:
            parsedFile.error.issues[0]?.message ??
            "Upload a valid certificate file.",
        }
      }

      const file = parsedFile.data
      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = file.name || "certificate"
      const contentType = file.type || "application/octet-stream"

      let verdict: { clean: boolean }
      try {
        verdict = await scanUploadedFile({
          data: buffer,
          filename,
          mimetype: contentType,
        })
      } catch {
        return {
          status: "error",
          message: "Could not verify the certificate file. Please try again.",
        }
      }
      if (!verdict.clean) {
        return {
          status: "error",
          message: "This certificate file failed a virus scan.",
        }
      }

      const { pathname } = await uploadCertificateBlob({
        buffer,
        contentType,
        filename,
      })
      const media = await payload.create({
        collection: "media",
        data: { alt: `${values.title} certificate`, blobPathname: pathname },
        overrideAccess: true,
      })
      certificateId = String(media.id)
    }

    const course = await payload.create({
      collection: "courses",
      data: {
        completedAt: values.completedAt,
        format: values.format,
        hours: values.hours,
        practitioner: user.id,
        provider: values.provider || undefined,
        source: "manual",
        subjectCategories: values.subjectCategories,
        title: values.title,
        ...(certificateId ? { certificate: certificateId } : {}),
      },
      overrideAccess: true,
    })

    return { status: "success", data: { courseId: String(course.id) } }
  }
)
