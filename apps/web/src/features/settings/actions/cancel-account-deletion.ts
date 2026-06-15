"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { revalidatePath } from "next/cache"
import { authedAction } from "~/lib/authed-action"
import { setUserDeletedAt } from "../api/set-user-deleted-at"

export type CancelAccountDeletionResult = ActionResult<void>

export const cancelAccountDeletion = authedAction<
  void,
  CancelAccountDeletionResult
>(async ({ user }) => {
  await setUserDeletedAt({ userId: user.id, deletedAt: null })

  if (user.slug) {
    revalidatePath(`/${user.slug}/settings/account`)
  }

  return { status: "success", data: undefined }
})
