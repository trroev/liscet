"use client"

import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { cn } from "@repo/ui/utils/cn"
import { type DialogPopupVariants, dialogPopup } from "./dialog.variants"

export type DialogRootProps = React.ComponentProps<typeof BaseDialog.Root>
export const DialogRoot = BaseDialog.Root

export type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export const DialogTrigger = BaseDialog.Trigger

export type DialogPortalProps = React.ComponentProps<typeof BaseDialog.Portal>
export const DialogPortal = BaseDialog.Portal

export type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>
export const DialogClose = BaseDialog.Close

export type DialogBackdropProps = React.ComponentProps<
  typeof BaseDialog.Backdrop
>
export const DialogBackdrop = ({
  className,
  ...props
}: DialogBackdropProps) => (
  <BaseDialog.Backdrop
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-ending-style:opacity-0 data-starting-style:opacity-0",
      "transition-opacity duration-200",
      className
    )}
    {...props}
  />
)

export type DialogPopupProps = React.ComponentProps<typeof BaseDialog.Popup> &
  DialogPopupVariants
export const DialogPopup = ({
  className,
  size,
  ...props
}: DialogPopupProps) => (
  <BaseDialog.Popup
    className={cn(dialogPopup({ size }), className)}
    {...props}
  />
)

export type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>
export const DialogTitle = ({ className, ...props }: DialogTitleProps) => (
  <BaseDialog.Title
    className={cn("font-display text-heading-md text-text-primary", className)}
    {...props}
  />
)

export type DialogDescriptionProps = React.ComponentProps<
  typeof BaseDialog.Description
>
export const DialogDescription = ({
  className,
  ...props
}: DialogDescriptionProps) => (
  <BaseDialog.Description
    className={cn("text-body text-text-secondary", className)}
    {...props}
  />
)
