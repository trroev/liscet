// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { ActionResult } from "@repo/types/ActionResult"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, cleanup, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useActionForm } from "./use-action-form"

afterEach(() => {
  cleanup()
})

type Data = { id: string }

const ok: ActionResult<Data> = { data: { id: "x" }, status: "success" }

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidateSpy, wrapper }
}

describe("useActionForm", () => {
  it("invalidates the declared query keys and calls onSuccess with the data", async () => {
    const { invalidateSpy, wrapper } = buildWrapper()
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useActionForm<Data>({ onSuccess, queryKeys: [["a"], ["b"]] }),
      { wrapper }
    )

    await act(async () => {
      await result.current.submit(() => Promise.resolve(ok))
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["a"] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["b"] })
    expect(onSuccess).toHaveBeenCalledWith({ id: "x" })
    expect(result.current.serverError).toBeUndefined()
  })

  it("surfaces the error message and skips onSuccess", async () => {
    const { wrapper } = buildWrapper()
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useActionForm<Data>({ onSuccess }), {
      wrapper,
    })

    await act(async () => {
      await result.current.submit(() =>
        Promise.resolve<ActionResult<Data>>({
          message: "Nope.",
          status: "error",
        })
      )
    })

    expect(result.current.serverError).toBe("Nope.")
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("suppresses the default message when onError returns true", async () => {
    const { wrapper } = buildWrapper()
    const onError = vi.fn(() => true)
    const { result } = renderHook(() => useActionForm<Data>({ onError }), {
      wrapper,
    })

    await act(async () => {
      await result.current.submit(() =>
        Promise.resolve<ActionResult<Data>>({
          code: "SLUG_TAKEN",
          message: "handled elsewhere",
          status: "error",
        })
      )
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SLUG_TAKEN" })
    )
    expect(result.current.serverError).toBeUndefined()
  })

  it("clears a surfaced error via clearServerError", async () => {
    const { wrapper } = buildWrapper()
    const { result } = renderHook(() => useActionForm<Data>(), { wrapper })

    await act(async () => {
      await result.current.submit(() =>
        Promise.resolve<ActionResult<Data>>({
          message: "Boom.",
          status: "error",
        })
      )
    })
    expect(result.current.serverError).toBe("Boom.")

    act(() => {
      result.current.clearServerError()
    })
    expect(result.current.serverError).toBeUndefined()
  })
})
