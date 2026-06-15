import { getPayload } from "payload"
import { verifyCertificateToken } from "~/features/courses/lib/certificate-token"
import config from "~/payload.config"

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token")
  const verified = token ? verifyCertificateToken({ token }) : null
  if (!verified) {
    return new Response("This download link is invalid or has expired.", {
      status: 403,
    })
  }

  const payload = await getPayload({ config })
  const media = await payload.findByID({
    collection: "media",
    depth: 0,
    disableErrors: true,
    id: verified.mediaId,
    overrideAccess: true,
  })
  if (!media?.url) {
    return new Response("Certificate not found.", { status: 404 })
  }

  const upstream = await fetch(media.url)
  if (!(upstream.ok && upstream.body)) {
    return new Response("Certificate not found.", { status: 404 })
  }

  const filename = media.filename ?? "certificate"
  return new Response(upstream.body, {
    headers: {
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="${filename}"`,
      "content-type":
        media.mimeType ??
        upstream.headers.get("content-type") ??
        "application/octet-stream",
    },
  })
}
