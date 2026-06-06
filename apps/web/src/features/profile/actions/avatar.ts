"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { match, P } from "ts-pattern"
import { z } from "zod"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { createMediaAsset, deleteMediaAsset } from "~/lib/queries/media"
import { serverAction } from "~/lib/server-action"
import { updateUserAvatar } from "../api/update-user-avatar"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number]

const isAllowedMimeType = (value: string): value is AllowedAvatarMimeType =>
  (ALLOWED_AVATAR_MIME_TYPES as ReadonlyArray<string>).includes(value)

const avatarFileSchema = z
  .instanceof(File, { message: "Provide an image file under `avatar`." })
  .refine((file) => file.size > 0, {
    message: "Provide an image file under `avatar`.",
  })
  .refine((file) => file.size <= MAX_AVATAR_BYTES, {
    message: "Avatar must be under 5 MB.",
  })
  .refine((file) => isAllowedMimeType(file.type), {
    message: "Avatar must be a JPEG, PNG, or WebP image.",
  })

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

const uploadAvatarImpl = async (
  formData: FormData
): Promise<UploadAvatarResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }
  const userDoc = viewer.user

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

  const previousAvatarId = extractAvatarId(userDoc.avatar)
  const altLabel = userDoc.name || userDoc.email
  const media = await createMediaAsset({
    file,
    alt: `${altLabel} profile photo`,
    fallbackName: "avatar",
  })

  await updateUserAvatar({ userId: userDoc.id, mediaId: media.id })

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

const removeAvatarImpl = async (): Promise<RemoveAvatarResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "error", message: "You must be signed in." }
  }
  const userDoc = viewer.user

  const avatarId = extractAvatarId(userDoc.avatar)

  await updateUserAvatar({ userId: userDoc.id, mediaId: null })

  if (avatarId) {
    await deleteMediaAsset(avatarId)
  }

  return { status: "success", data: undefined }
}

export const uploadAvatar = serverAction(uploadAvatarImpl)
export const removeAvatar = serverAction(removeAvatarImpl)
