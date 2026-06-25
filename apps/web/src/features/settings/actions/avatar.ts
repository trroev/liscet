"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { match, P } from "ts-pattern"
import type { z } from "zod"
import { authedAction } from "~/lib/authed-action"
import { createMediaAsset, deleteMediaAsset } from "~/lib/queries/media"
import { updateUserAvatar } from "../api/update-user-avatar"
import { avatarFileSchema } from "../lib/avatar-upload"

type AvatarFile = z.infer<typeof avatarFileSchema>

export type UploadAvatarData = { mediaId: string; url: string }
export type UploadAvatarResult = ActionResult<UploadAvatarData>
export type RemoveAvatarResult = ActionResult<void>

const extractAvatarId = (avatar: unknown): string | null =>
  match(avatar)
    .with(P.string, (id) => id)
    .with(P.number, (id) => String(id))
    .with({ id: P.string }, ({ id }) => id)
    .with({ id: P.number }, ({ id }) => String(id))
    .otherwise(() => null)

export const uploadAvatar = authedAction<FormData, UploadAvatarResult>(
  async ({ user, input: formData }) => {
    const parsed = avatarFileSchema.safeParse(formData.get("avatar"))
    if (!parsed.success) {
      return {
        status: "error",
        message:
          parsed.error.issues[0]?.message ??
          "Provide an image file under `avatar`.",
      }
    }
    const file: AvatarFile = parsed.data

    const previousAvatarId = extractAvatarId(user.avatar)
    const altLabel = user.displayName || user.email
    const media = await createMediaAsset({
      file,
      alt: `${altLabel} profile photo`,
      fallbackName: "avatar",
    })

    await updateUserAvatar({ userId: user.id, mediaId: media.id })

    if (previousAvatarId && previousAvatarId !== media.id) {
      await deleteMediaAsset(previousAvatarId)
    }

    return {
      status: "success",
      data: {
        mediaId: media.id,
        url: media.url ?? "",
      },
    }
  }
)

export const removeAvatar = authedAction<void, RemoveAvatarResult>(
  async ({ user }) => {
    const avatarId = extractAvatarId(user.avatar)

    await updateUserAvatar({ userId: user.id, mediaId: null })

    if (avatarId) {
      await deleteMediaAsset(avatarId)
    }

    return { status: "success", data: undefined }
  }
)
