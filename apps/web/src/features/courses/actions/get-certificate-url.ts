"use server"

import "server-only"

import { env } from "@repo/env/app"
import { getPayload } from "payload"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"
import {
  CERTIFICATE_LINK_TTL_MS,
  signCertificateToken,
} from "../lib/certificate-token"
import type { CertificateUrlResult } from "../lib/types"

const getCertificateUrlImpl = async (
  courseId: string
): Promise<CertificateUrlResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }

  const payload = await getPayload({ config })
  const course = await payload.findByID({
    collection: "courses",
    depth: 0,
    disableErrors: true,
    id: courseId,
    overrideAccess: true,
  })

  const practitionerId =
    course && typeof course.practitioner === "object"
      ? course.practitioner.id
      : course?.practitioner
  if (!course || practitionerId !== viewer.user.id) {
    return { status: "error", message: "Certificate not found." }
  }

  const mediaId =
    typeof course.certificate === "object"
      ? course.certificate?.id
      : course.certificate
  if (!mediaId) {
    return { status: "error", message: "This course has no certificate." }
  }

  const expiresAt = Date.now() + CERTIFICATE_LINK_TTL_MS
  const token = signCertificateToken({ expiresAt, mediaId })
  const url = new URL("/api/courses/certificate", env.BASE_URL)
  url.searchParams.set("token", token)

  return { status: "success", data: { url: url.toString() } }
}

export const getCertificateUrl = serverAction(getCertificateUrlImpl)
