"use server"

import "server-only"

import { sendEmail } from "@repo/emails/send"
import { DataExportEmail } from "@repo/emails/templates/DataExportEmail"
import { env as appEnv } from "@repo/env/app"
import { env as blobEnv } from "@repo/env/blob"
import type { ActionResult } from "@repo/types/ActionResult"
import { put } from "@vercel/blob"
import { authedAction } from "~/lib/authed-action"
import { buildDataExport } from "../lib/build-data-export"
import { EXPORT_LINK_TTL_MS, signExportToken } from "../lib/export-token"

export type RequestDataExportResult = ActionResult<void>

export const requestDataExport = authedAction<void, RequestDataExportResult>(
  async ({ user }) => {
    const dataExport = await buildDataExport({ user })

    const blob = await put(
      `data-exports/${user.id}.json`,
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
      react: DataExportEmail({
        downloadUrl: downloadUrl.toString(),
        expiresAt: new Date(expiresAt),
      }),
      subject: "Your Liscet data export",
      to: user.email,
    })

    return { status: "success", data: undefined }
  }
)
