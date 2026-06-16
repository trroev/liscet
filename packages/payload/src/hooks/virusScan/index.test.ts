// @vitest-environment node
import { APIError } from "payload"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createVirusScanHook, type Scanner } from "./index"

vi.mock("@repo/env/scan", () => ({
  env: {
    VIRUS_SCAN_API_KEY: undefined,
    VIRUS_SCAN_URL: "https://scan.test/scan",
  },
}))

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn<(error: unknown) => string>(() => "event-id"),
}))

vi.mock("@repo/observability", () => ({ captureException }))

type HookArg = Parameters<ReturnType<typeof createVirusScanHook>>[0]

const data = { alt: "a certificate" }

const argsWithFile = (): HookArg =>
  ({
    data,
    req: {
      file: {
        data: Buffer.from("file-bytes"),
        mimetype: "application/pdf",
        name: "cert.pdf",
        size: 10,
      },
    },
  }) as unknown as HookArg

const argsWithoutFile = (): HookArg => ({ data, req: {} }) as unknown as HookArg

describe("virusScan beforeChange hook", () => {
  beforeEach(() => {
    captureException.mockClear()
  })

  it("passes a clean file through unchanged", async () => {
    const scan: Scanner = vi.fn(async () => ({ clean: true }))
    const hook = createVirusScanHook(scan)

    await expect(hook(argsWithFile())).resolves.toBe(data)
    expect(scan).toHaveBeenCalledOnce()
    expect(captureException).not.toHaveBeenCalled()
  })

  it("skips the scan entirely when there is no file", async () => {
    const scan: Scanner = vi.fn(async () => ({ clean: true }))
    const hook = createVirusScanHook(scan)

    await expect(hook(argsWithoutFile())).resolves.toBe(data)
    expect(scan).not.toHaveBeenCalled()
  })

  it("rejects an infected file with a 400 and does not capture it to Sentry", async () => {
    const scan: Scanner = vi.fn(async () => ({
      clean: false,
      signature: "Eicar-Test-Signature",
    }))
    const hook = createVirusScanHook(scan)

    await expect(hook(argsWithFile())).rejects.toMatchObject({
      status: 400,
    })
    expect(captureException).not.toHaveBeenCalled()
  })

  it("fails closed and captures to Sentry on a provider error", async () => {
    const scan: Scanner = vi.fn(() =>
      Promise.reject(new Error("provider unavailable"))
    )
    const hook = createVirusScanHook(scan)

    const result = await hook(argsWithFile()).catch((error: unknown) => error)

    expect(result).toBeInstanceOf(APIError)
    expect((result as APIError).status).toBe(422)
    expect(captureException).toHaveBeenCalledOnce()
  })

  it("fails closed on a scan timeout", async () => {
    const scan: Scanner = vi.fn(() =>
      Promise.reject(
        Object.assign(new Error("The operation timed out."), {
          name: "AbortError",
        })
      )
    )
    const hook = createVirusScanHook(scan)

    await expect(hook(argsWithFile())).rejects.toMatchObject({ status: 422 })
    expect(captureException).toHaveBeenCalledOnce()
  })
})
