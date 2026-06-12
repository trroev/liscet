"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { revalidatePath } from "next/cache"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import { setUserDeletedAt } from "../api/set-user-deleted-at"

export type CancelAccountDeletionResult = ActionResult<void>

const cancelAccountDeletionImpl =
  async (): Promise<CancelAccountDeletionResult> => {
    const viewer = await getCurrentViewer()
    if (viewer?.kind !== "user") {
      return { status: "error", message: "You must be signed in." }
    }
    const userDoc = viewer.user

    await setUserDeletedAt({ userId: userDoc.id, deletedAt: null })

    if (userDoc.slug) {
      revalidatePath(`/${userDoc.slug}/settings/account`)
    }

    return { status: "success", data: undefined }
  }

export const cancelAccountDeletion = serverAction(cancelAccountDeletionImpl)
