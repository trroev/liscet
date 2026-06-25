"use client"

import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { toast } from "@repo/ui/components/Toast"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { FormError, useActionForm } from "~/lib/use-action-form"
import {
  type DeleteAccountData,
  deleteAccount,
} from "../../actions/delete-account"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required."),
})

export type DeleteAccountFormProps = {
  onDeleted: VoidFunction
}

export const DeleteAccountForm = ({ onDeleted }: DeleteAccountFormProps) => {
  const { serverError, submit } = useActionForm<DeleteAccountData>({
    onSuccess: () => {
      onDeleted()
      toast.success("Account scheduled for deletion", {
        description: "You can cancel from the banner until it's permanent.",
      })
    },
  })

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onChange: deleteAccountSchema },
    onSubmit: async ({ value }) => {
      await submit(() => deleteAccount({ password: value.password }))
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="password">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Password"
          >
            <Input
              autoComplete="current-password"
              id="delete-account-password"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              type="password"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <FormError message={serverError} />
      <div className="flex justify-end gap-2">
        <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              disabled={!canSubmit || isSubmitting}
              type="submit"
              variant="destructive"
            >
              {isSubmitting ? "Deleting…" : "Delete account"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
