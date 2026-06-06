import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"

export const serverAction =
  <TArgs extends ReadonlyArray<unknown>, TData>(
    action: (...args: TArgs) => Promise<ActionResult<TData>>
  ): ((...args: TArgs) => Promise<ActionResult<TData>>) =>
  async (...args: TArgs): Promise<ActionResult<TData>> => {
    try {
      return await action(...args)
    } catch (error) {
      unstable_rethrow(error)
      captureException(error)
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR",
      }
    }
  }
