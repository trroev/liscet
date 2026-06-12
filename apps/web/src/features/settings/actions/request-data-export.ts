"use server"

import "server-only"

import { sendEmail } from "@repo/emails/send"
import { DataExportEmail } from "@repo/emails/templates/DataExportEmail"
import { env as appEnv } from "@repo/env/app"
import { env as blobEnv } from "@repo/env/blob"
import { env as emailEnv } from "@repo/env/email"
import type { ActionResult } from "@repo/types/ActionResult"
import { put } from "@vercel/blob"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import { buildDataExport } from "../lib/build-data-export"
import { EXPORT_LINK_TTL_MS, signExportToken } from "../lib/export-token"

export type RequestDataExportResult = ActionResult<void>

const requestDataExportImpl = async (): Promise<RequestDataExportResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }
  const userDoc = viewer.user

  const dataExport = await buildDataExport({ user: userDoc })

  const blob = await put(
    `data-exports/${userDoc.id}.json`,
    JSON.stringify(dataExport, null, 2),
    {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/json",
      token: blobEnv.BLOB_READ_WRITE_TOKEN,
    }
  )

  const expiresAt = Date.now() + EXPORT_LINK_TTL_MS
  const token = signExportToken({ expiresAt, pathname: blob.pathname })
  const downloadUrl = new URL("/api/data-export", appEnv.BASE_URL)
  downloadUrl.searchParams.set("token", token)

  await sendEmail({
    from: emailEnv.EMAIL_FROM,
    react: DataExportEmail({
      downloadUrl: downloadUrl.toString(),
      expiresAt: new Date(expiresAt),
    }),
    subject: "Your Liscet data export",
    to: userDoc.email,
  })

  return { status: "success", data: undefined }
}

export const requestDataExport = serverAction(requestDataExportImpl)
