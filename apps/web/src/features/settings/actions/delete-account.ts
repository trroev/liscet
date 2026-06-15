"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { revalidatePath } from "next/cache"
import { match } from "ts-pattern"
import { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { verifyUserPassword } from "~/lib/queries/verify-user-password"
import { setUserDeletedAt } from "../api/set-user-deleted-at"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required."),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
export type DeleteAccountData = { deletedAt: string }
export type DeleteAccountResult = ActionResult<DeleteAccountData>

export const deleteAccount = authedAction(
  deleteAccountSchema,
  async ({ user, input }): Promise<DeleteAccountResult> => {
    if (!user.betterAuthId) {
      return {
        status: "error",
        message: "Account deletion is unavailable for this account.",
      }
    }

    const outcome = await verifyUserPassword({
      betterAuthId: user.betterAuthId,
      password: input.password,
    })
    const passwordError = match(outcome)
      .with("valid", () => null)
      .with("invalid", () => "Incorrect password.")
      .with(
        "unavailable",
        () => "Password sign-in is not configured for this account."
      )
      .exhaustive()
    if (passwordError) {
      return { status: "error", message: passwordError }
    }

    const deletedAt = new Date().toISOString()
    await setUserDeletedAt({ userId: user.id, deletedAt })

    if (user.slug) {
      revalidatePath(`/${user.slug}/settings/account`)
    }

    return { status: "success", data: { deletedAt } }
  }
)
