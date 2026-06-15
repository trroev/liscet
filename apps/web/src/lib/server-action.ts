import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"

export const INTERNAL_ERROR_RESULT = {
  code: "INTERNAL_ERROR",
  message: "Something went wrong. Please try again.",
  status: "error",
} as const

/**
 * The single error policy for server actions: let Next.js control-flow errors
 * (redirect/notFound) propagate via `unstable_rethrow`, report anything else to
 * Sentry, and surface a canonical `INTERNAL_ERROR` result. Shared by
 * `serverAction` and `authedAction` so the policy lives in one place.
 */
export const withErrorPolicy = async <TResult>(
  run: () => Promise<TResult>
): Promise<TResult | typeof INTERNAL_ERROR_RESULT> => {
  try {
    return await run()
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return INTERNAL_ERROR_RESULT
  }
}

export const serverAction =
  <TArgs extends ReadonlyArray<unknown>, TData>(
    action: (...args: TArgs) => Promise<ActionResult<TData>>
  ): ((...args: TArgs) => Promise<ActionResult<TData>>) =>
  (...args: TArgs): Promise<ActionResult<TData>> =>
    withErrorPolicy(() => action(...args))
