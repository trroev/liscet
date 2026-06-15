import "server-only"

import { scopeSentry } from "@repo/observability"
import type { User } from "@repo/payload/payload-types"
import { getPayload, type Payload } from "payload"
import type { z } from "zod"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { withErrorPolicy } from "~/lib/server-action"
import config from "~/payload.config"

export type AuthedActionError = {
  readonly status: "error"
  readonly code: "UNAUTHENTICATED" | "INVALID_INPUT" | "INTERNAL_ERROR"
  readonly message: string
}

type AuthedContext<TInput> = {
  readonly user: User
  readonly payload: Payload
  readonly input: TInput
}

type AuthedHandler<TInput, TResult> = (
  context: AuthedContext<TInput>
) => Promise<TResult>

const UNAUTHENTICATED: AuthedActionError = {
  code: "UNAUTHENTICATED",
  message: "You must be signed in.",
  status: "error",
}

const invalidInput = (message: string | undefined): AuthedActionError => ({
  code: "INVALID_INPUT",
  message: message ?? "Check the form and retry.",
  status: "error",
})

/**
 * Wrap a server action's real logic in the shared auth + validation + error
 * policy. Resolves the signed-in practitioner (returning the canonical
 * `UNAUTHENTICATED` result without invoking the handler when absent), opens
 * Payload, and runs `withErrorPolicy`. The handler receives a typed
 * `{ user, payload, input }` context and contains only feature logic.
 *
 * Schema overload: validates the raw input against `schema`, returning the
 * canonical `INVALID_INPUT` result on failure and passing the parsed value as
 * `input`. Schema-less overload: passes the raw input through untouched for
 * actions that self-validate (FormData/file uploads) or take no input.
 */
export function authedAction<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  handler: AuthedHandler<z.output<TSchema>, TResult>
): (input: z.input<TSchema>) => Promise<TResult | AuthedActionError>
export function authedAction<TInput, TResult>(
  handler: AuthedHandler<TInput, TResult>
): (input: TInput) => Promise<TResult | AuthedActionError>
export function authedAction(
  schemaOrHandler: z.ZodType | AuthedHandler<unknown, unknown>,
  maybeHandler?: AuthedHandler<unknown, unknown>
): (input: unknown) => Promise<unknown> {
  const schema = maybeHandler ? (schemaOrHandler as z.ZodType) : null
  const handler = (maybeHandler ?? schemaOrHandler) as AuthedHandler<
    unknown,
    unknown
  >

  return (input: unknown): Promise<unknown> =>
    withErrorPolicy(async () => {
      const viewer = await getCurrentViewer()
      if (viewer?.kind !== "user") {
        return UNAUTHENTICATED
      }
      scopeSentry({ practitionerId: viewer.user.id })

      let resolvedInput = input
      if (schema) {
        const parsed = schema.safeParse(input)
        if (!parsed.success) {
          return invalidInput(parsed.error.issues[0]?.message)
        }
        resolvedInput = parsed.data
      }

      const payload = await getPayload({ config })
      return handler({ input: resolvedInput, payload, user: viewer.user })
    })
}
