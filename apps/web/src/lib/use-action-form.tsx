"use client"

import type { ActionResult } from "@repo/types/ActionResult"
import { type QueryKey, useQueryClient } from "@tanstack/react-query"
import type React from "react"
import { useCallback, useState } from "react"
import { match } from "ts-pattern"

type ActionError<TResult> = Extract<TResult, { status: "error" }>

export type UseActionFormOptions<
  TData,
  TResult extends ActionResult<TData> = ActionResult<TData>,
> = {
  /**
   * Runs before the default error handling. Return `true` to signal the error
   * was fully handled and suppress the built-in `serverError` message; return
   * `false` / nothing to fall through to it.
   */
  onError?: (error: ActionError<TResult>) => boolean | undefined
  onSuccess?: (data: TData) => void | Promise<void>
  queryKeys?: ReadonlyArray<QueryKey>
}

export type UseActionForm<
  TData,
  TResult extends ActionResult<TData> = ActionResult<TData>,
> = {
  clearServerError: () => void
  serverError: string | undefined
  submit: (action: () => Promise<TResult>) => Promise<void>
}

/**
 * Owns the shared submit ritual for `ActionResult`-returning mutations: resets
 * the error, awaits the action, branches the result exhaustively, invalidates
 * the declared query keys on success, and surfaces the message on error.
 */
export const useActionForm = <
  TData = void,
  TResult extends ActionResult<TData> = ActionResult<TData>,
>({
  onError,
  onSuccess,
  queryKeys,
}: UseActionFormOptions<TData, TResult> = {}): UseActionForm<
  TData,
  TResult
> => {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | undefined>()

  const clearServerError = useCallback((): void => {
    setServerError(undefined)
  }, [])

  const submit = useCallback(
    async (action: () => Promise<TResult>): Promise<void> => {
      setServerError(undefined)
      const result: ActionResult<TData> = await action()
      await match(result)
        .with({ status: "error" }, (error): void => {
          const handled = onError?.(error as ActionError<TResult>)
          if (handled !== true) {
            setServerError(error.message)
          }
        })
        .with({ status: "success" }, async ({ data }): Promise<void> => {
          if (queryKeys?.length) {
            await Promise.all(
              queryKeys.map((queryKey) =>
                queryClient.invalidateQueries({ queryKey })
              )
            )
          }
          await onSuccess?.(data)
        })
        .exhaustive()
    },
    [onError, onSuccess, queryClient, queryKeys]
  )

  return { clearServerError, serverError, submit }
}

export type FormErrorProps = {
  message: string | undefined
}

/**
 * The single rendering of a form's server-error message, shared across every
 * form that submits through {@link useActionForm}.
 */
export const FormError = ({
  message,
}: FormErrorProps): React.JSX.Element | null =>
  message ? (
    <p
      aria-live="polite"
      className="font-sans text-body-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  ) : null
