"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { revalidatePath } from "next/cache"
import { match } from "ts-pattern"
import { z } from "zod"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { verifyUserPassword } from "~/lib/queries/verify-user-password"
import { serverAction } from "~/lib/server-action"
import { setUserDeletedAt } from "../api/set-user-deleted-at"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required."),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
export type DeleteAccountData = { deletedAt: string }
export type DeleteAccountResult = ActionResult<DeleteAccountData>

const deleteAccountImpl = async (
  input: DeleteAccountInput
): Promise<DeleteAccountResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }
  const userDoc = viewer.user

  const parsed = deleteAccountSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Password is required.",
    }
  }

  if (!userDoc.betterAuthId) {
    return {
      status: "error",
      message: "Account deletion is unavailable for this account.",
    }
  }

  const outcome = await verifyUserPassword({
    betterAuthId: userDoc.betterAuthId,
    password: parsed.data.password,
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
  await setUserDeletedAt({ userId: userDoc.id, deletedAt })

  if (userDoc.slug) {
    revalidatePath(`/${userDoc.slug}/settings/account`)
  }

  return { status: "success", data: { deletedAt } }
}

export const deleteAccount = serverAction(deleteAccountImpl)
