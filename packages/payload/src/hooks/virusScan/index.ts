import { betterFetch } from "@better-fetch/fetch"
import { env } from "@repo/env/scan"
import { createLogger } from "@repo/logger"
import { captureException } from "@repo/observability"
import { APIError, type CollectionBeforeChangeHook } from "payload"
import { z } from "zod"

/**
 * Provider choice: hosted ClamAV reached over HTTP.
 *
 * The `beforeChange` gate must be synchronous, bounded at 30s, and fail closed.
 * That requirement rules out both options the ticket named:
 *
 * - VirusTotal is asynchronous — you submit a file and poll for a verdict that
 *   can take minutes. A 30s-capped synchronous gate would routinely time out on
 *   novel files and, because we fail closed, reject *clean* uploads. It also
 *   ships customer files (license certificate PDFs — PII) to a third party and
 *   is rate-limited on the free tier. Wrong tool for this job.
 * - ClamAV in-process is impossible on Vercel serverless: `clamd` needs a
 *   persistent daemon and a ~1GB signature database that a function cannot host.
 *
 * So ClamAV runs as a persistent service and we call it synchronously over
 * HTTP. The transport lives behind the `Scanner` seam below so the fail-closed
 * gate logic stays unit-testable and dev/CI can run without a live `clamd`.
 *
 * Caveat: this gate only protects server-side uploads. If the Vercel Blob
 * adapter is ever switched to client uploads (`clientUploads: true`), the file
 * bytes never pass through `beforeChange` and this scan is bypassed.
 */

const SCAN_TIMEOUT_MS = 30_000

const scanResponseSchema = z.object({
  clean: z.boolean(),
  signature: z.string().optional(),
})

export type ScanVerdict = {
  readonly clean: boolean
  readonly signature?: string
}

export type Scanner = (args: {
  readonly data: Buffer
  readonly filename: string
  readonly mimetype: string
}) => Promise<ScanVerdict>

const log = createLogger({ name: "payload.virus-scan" })

/**
 * Default scanner: POSTs the raw file bytes to a ClamAV REST gateway and parses
 * its JSON verdict. The wire contract — raw body, `x-filename` header, and a
 * `{ clean, signature? }` JSON response — is ours to define because the gateway
 * is infrastructure we host. `throw: true` surfaces transport, timeout, and
 * schema failures as rejections so the hook can fail closed.
 */
const clamavRestScanner: Scanner = async ({ data, filename, mimetype }) => {
  if (!env.VIRUS_SCAN_URL) {
    throw new Error("VIRUS_SCAN_URL is not configured")
  }

  const verdict = await betterFetch(env.VIRUS_SCAN_URL, {
    body: new Blob([new Uint8Array(data)], { type: mimetype }),
    headers: {
      "x-filename": filename,
      ...(env.VIRUS_SCAN_API_KEY
        ? { authorization: `Bearer ${env.VIRUS_SCAN_API_KEY}` }
        : {}),
    },
    method: "POST",
    output: scanResponseSchema,
    retry: 0,
    throw: true,
    timeout: SCAN_TIMEOUT_MS,
  })

  return { clean: verdict.clean, signature: verdict.signature }
}

/**
 * Scans an uploaded file, applying the configuration gate: when no
 * `VIRUS_SCAN_URL` is set the gate is inert — every environment logs a warning
 * and treats the file as clean so uploads are not blocked before a scanner is
 * provisioned (#64). The MIME/size allowlist on the `media` collection is the
 * baseline upload control until then. Shared by the Media `beforeChange` hook
 * and the certificate upload action — both upload paths run the same gate. Once
 * a scanner is configured it throws on provider error/timeout so callers fail
 * closed.
 */
export const scanUploadedFile: Scanner = (args) => {
  if (!env.VIRUS_SCAN_URL) {
    log.warn("virus scan skipped — VIRUS_SCAN_URL is not set")
    return Promise.resolve({ clean: true })
  }
  return clamavRestScanner(args)
}

/**
 * Builds the `beforeChange` virus-scan gate. The scanner is injected (defaulting
 * to {@link scanUploadedFile}) so tests can drive every branch with a mock.
 */
export const createVirusScanHook =
  (scan: Scanner = scanUploadedFile): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const file = req.file
    if (!file) {
      return data
    }

    let verdict: ScanVerdict
    try {
      verdict = await scan({
        data: file.data,
        filename: file.name,
        mimetype: file.mimetype,
      })
    } catch (error) {
      captureException(error)
      log.withError(error).error("virus scan provider error")
      throw new APIError("Unable to verify file safety.", 422)
    }

    if (!verdict.clean) {
      log
        .withMetadata({ signature: verdict.signature })
        .warn("upload rejected — file failed virus scan")
      throw new APIError("File failed virus scan.", 400)
    }

    return data
  }

export const virusScan = createVirusScanHook()
