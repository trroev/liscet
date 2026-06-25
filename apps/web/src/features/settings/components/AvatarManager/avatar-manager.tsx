"use client"

import { RiUploadLine } from "@remixicon/react"
import { createLogger } from "@repo/logger"
import { Avatar } from "@repo/ui/components/Avatar"
import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { toast } from "@repo/ui/components/Toast"
import { captureException } from "@sentry/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { match } from "ts-pattern"
import { WidgetErrorFallback } from "~/components/WidgetErrorFallback"
import { removeAvatar, uploadAvatar } from "../../actions/avatar"
import { AVATAR_MIME_TYPES, avatarFileSchema } from "../../lib/avatar-upload"

const log = createLogger({ name: "settings.avatar-manager" })

type AvatarManagerProps = {
  avatarUrl: string | null
  email: string
}

type Selection = Readonly<{ file: File; previewUrl: string }>

type DialogStatus =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "error"; message: string }

const buildInitial = (email: string): string =>
  email.charAt(0).toUpperCase() || "?"

const AvatarManagerInner = ({ avatarUrl, email }: AvatarManagerProps) => {
  const router = useRouter()
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selection, setSelection] = useState<Selection | undefined>()
  const [status, setStatus] = useState<DialogStatus>({ kind: "idle" })
  const [isRemoving, startRemove] = useTransition()

  useEffect(
    () => () => {
      if (selection) {
        URL.revokeObjectURL(selection.previewUrl)
      }
    },
    [selection]
  )

  const resetDialog = () => {
    if (selection) {
      URL.revokeObjectURL(selection.previewUrl)
    }
    setSelection(undefined)
    setStatus({ kind: "idle" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetDialog()
    }
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      return
    }
    const parsed = avatarFileSchema.safeParse(file)
    if (!parsed.success) {
      setStatus({
        kind: "error",
        message:
          parsed.error.issues[0]?.message ?? "Choose a valid avatar image.",
      })
      return
    }
    if (selection) {
      URL.revokeObjectURL(selection.previewUrl)
    }
    setSelection({ file, previewUrl: URL.createObjectURL(file) })
    setStatus({ kind: "idle" })
  }

  const handleConfirm = async () => {
    if (!selection) {
      return
    }
    setStatus({ kind: "uploading" })
    const formData = new FormData()
    formData.set("avatar", selection.file)
    const result = await uploadAvatar(formData)
    match(result)
      .with({ status: "error" }, ({ message }) => {
        setStatus({ kind: "error", message })
      })
      .with({ status: "success" }, () => {
        resetDialog()
        setIsOpen(false)
        router.refresh()
        toast.success("Photo updated")
      })
      .exhaustive()
  }

  const handleRemove = () => {
    startRemove(async () => {
      const result = await removeAvatar()
      match(result)
        .with({ status: "success" }, () => {
          router.refresh()
          toast.success("Photo removed")
        })
        .with({ status: "error" }, ({ message }) => {
          log.withMetadata({ message }).error("failed to remove avatar")
          toast.error("Couldn't remove photo", {
            description: "Something went wrong. Please try again.",
          })
        })
        .exhaustive()
    })
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar
        alt="Profile photo"
        initials={buildInitial(email)}
        size="lg"
        src={avatarUrl}
      />

      <div className="flex flex-col gap-2">
        <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
          <Dialog.Trigger render={<Button>Change photo</Button>} />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Title>Update profile photo</Dialog.Title>
              <Dialog.Description>
                JPEG, PNG, or WebP up to 5 MB.
              </Dialog.Description>

              <div className="mt-6 flex flex-col gap-4">
                <label
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-border border-dashed bg-surface p-6 text-body-sm text-text-secondary transition-colors hover:bg-secondary/75"
                  htmlFor={fileInputId}
                >
                  <RiUploadLine aria-hidden="true" size={20} />
                  <span>Click to choose an image</span>
                </label>
                <input
                  accept={AVATAR_MIME_TYPES.join(",")}
                  className="sr-only"
                  id={fileInputId}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  ref={fileInputRef}
                  type="file"
                />

                {selection && (
                  <div className="flex items-center gap-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border">
                      {/* biome-ignore lint/performance/noImgElement: blob preview URL, next/image not applicable */}
                      <img
                        alt="Selected avatar preview"
                        className="h-full w-full object-cover"
                        height={96}
                        src={selection.previewUrl}
                        width={96}
                      />
                    </div>
                    <p className="text-body-sm text-text-secondary">
                      {selection.file.name}
                    </p>
                  </div>
                )}

                {status.kind === "error" && (
                  <p
                    aria-live="polite"
                    className="text-body-sm text-destructive"
                    role="alert"
                  >
                    {status.message}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  render={<Button variant="ghost">Cancel</Button>}
                />
                <Button
                  disabled={!selection || status.kind === "uploading"}
                  onClick={handleConfirm}
                >
                  {match(status)
                    .with({ kind: "uploading" }, () => "Uploading…")
                    .otherwise(() => "Upload photo")}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        {avatarUrl && (
          <Button
            disabled={isRemoving}
            onClick={handleRemove}
            size="sm"
            variant="ghost"
          >
            {isRemoving ? "Removing…" : "Remove photo"}
          </Button>
        )}
      </div>
    </div>
  )
}

export const AvatarManager = (props: AvatarManagerProps) => (
  <ErrorBoundary
    fallbackRender={({ resetErrorBoundary }) => (
      <WidgetErrorFallback
        description="We couldn't load the profile photo controls. The rest of your profile is still available."
        resetErrorBoundary={resetErrorBoundary}
        title="Couldn't load profile photo controls"
      />
    )}
    onError={(error) => captureException(error)}
  >
    <AvatarManagerInner {...props} />
  </ErrorBoundary>
)
