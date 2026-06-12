import { env } from "@repo/env/blob"
import { get } from "@vercel/blob"
import { verifyExportToken } from "~/features/settings/lib/export-token"

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token")
  const payload = token ? verifyExportToken({ token }) : null
  if (!payload) {
    return new Response("This download link is invalid or has expired.", {
      status: 403,
    })
  }

  const blob = await get(payload.pathname, {
    access: "private",
    token: env.BLOB_READ_WRITE_TOKEN,
  })
  if (!blob || blob.statusCode !== 200) {
    return new Response("Export not found.", { status: 404 })
  }

  return new Response(blob.stream, {
    headers: {
      "cache-control": "no-store",
      "content-disposition": 'attachment; filename="liscet-data-export.json"',
      "content-type": "application/json",
    },
  })
}
