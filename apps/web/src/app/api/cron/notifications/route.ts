import { env } from "@repo/env/app"
import { createLogger } from "@repo/logger"
import { captureException } from "@sentry/nextjs"
import { getPayload } from "payload"
import { dispatchRenewalNotifications } from "~/features/notifications/dispatch"
import config from "~/payload.config"

const log = createLogger({ name: "cron.notifications" })

export async function GET(request: Request): Promise<Response> {
  // Vercel Cron injects `Authorization: Bearer <CRON_SECRET>` on each run.
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const summary = await dispatchRenewalNotifications({
      now: new Date(),
      payload,
    })

    log.withMetadata(summary).info("renewal notification dispatch complete")

    return Response.json(summary)
  } catch (error) {
    log.withError(error).error("renewal notification dispatch failed")
    captureException(error)

    return new Response("Internal Server Error", { status: 500 })
  }
}
