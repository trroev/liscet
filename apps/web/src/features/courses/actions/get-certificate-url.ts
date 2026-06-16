"use server"

import "server-only"

import { authedAction } from "~/lib/authed-action"
import { presignCertificateUrl } from "../lib/certificate-blob"
import type { CertificateUrlResult } from "../lib/types"

export const getCertificateUrl = authedAction<string, CertificateUrlResult>(
  async ({ user, payload, input: courseId }) => {
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
    if (!course || practitionerId !== user.id) {
      return { status: "error", message: "Certificate not found." }
    }

    const mediaId =
      typeof course.certificate === "object"
        ? course.certificate?.id
        : course.certificate
    if (!mediaId) {
      return { status: "error", message: "This course has no certificate." }
    }

    // Read as the practitioner (not overrideAccess) so `canReadOwnMedia` is the
    // authorization gate, then presign the private blob.
    const media = await payload.findByID({
      collection: "media",
      depth: 0,
      disableErrors: true,
      id: mediaId,
      overrideAccess: false,
      user,
    })
    if (!media?.blobPathname) {
      return { status: "error", message: "Certificate not found." }
    }

    const url = await presignCertificateUrl({ pathname: media.blobPathname })
    return { status: "success", data: { url } }
  }
)
