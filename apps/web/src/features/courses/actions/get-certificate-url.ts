"use server"

import "server-only"

import { practitionerData } from "@repo/payload/queries/practitioner-data"
import { match } from "ts-pattern"
import { authedAction } from "~/lib/authed-action"
import { presignCertificateUrl } from "../lib/certificate-blob"
import type { CertificateUrlResult } from "../lib/types"

export const getCertificateUrl = authedAction<string, CertificateUrlResult>(
  async ({ user, payload, input: courseId }) => {
    const certificate = await practitionerData({
      payload,
      practitionerId: user.id,
    }).certificateFor(courseId)

    return await match(certificate)
      .with({ status: "ok" }, async ({ blobPathname }) => {
        const url = await presignCertificateUrl({ pathname: blobPathname })
        return { data: { url }, status: "success" } as const
      })
      .with(
        { status: "no-certificate" },
        () =>
          ({
            message: "This course has no certificate.",
            status: "error",
          }) as const
      )
      .with(
        { status: "not-found" },
        () => ({ message: "Certificate not found.", status: "error" }) as const
      )
      .exhaustive()
  }
)
