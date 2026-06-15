"use server"

import "server-only"

import { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { createMediaAsset } from "~/lib/queries/media"
import { logCourseSchema } from "../lib/schema"
import type { LogCourseResult } from "../lib/types"

const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024

// TODO(#58): virus-scan certificate uploads; v1 mitigates with the allowlist below.
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
      const media = await createMediaAsset({
        alt: `${values.title} certificate`,
        fallbackName: "certificate",
        file: parsedFile.data,
      })
      certificateId = media.id
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
