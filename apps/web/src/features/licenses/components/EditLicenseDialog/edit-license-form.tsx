"use client"

import { Button } from "@repo/ui/components/Button"
import { Dialog } from "@repo/ui/components/Dialog"
import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { Select } from "@repo/ui/components/Select"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { DASHBOARD_QUERY_KEY, LICENSES_QUERY_KEY } from "~/lib/query-keys"
import { FormError, useActionForm } from "~/lib/use-action-form"
import { updateLicense } from "../../actions/update-license"
import { toDateInputValue } from "../../lib/format"
import {
  RENEWAL_CYCLE_OPTION_VALUES,
  RENEWAL_CYCLE_OPTIONS,
  type RenewalCycleOptionValue,
  toRenewalCycleOptionValue,
} from "../../lib/renewal-cycle"
import type { LicenseView } from "../../lib/types"

const editLicenseSchema = z.object({
  expiresAt: z.iso.date("Enter a valid expiration date."),
  renewalCycleMonths: z.enum(
    RENEWAL_CYCLE_OPTION_VALUES as ReadonlyArray<RenewalCycleOptionValue>,
    "Select a renewal cycle."
  ),
})

export type EditLicenseFormProps = {
  license: LicenseView
  onSaved: () => void
}

export const EditLicenseForm = ({
  license,
  onSaved,
}: EditLicenseFormProps): React.JSX.Element => {
  const { serverError, submit } = useActionForm<LicenseView>({
    onSuccess: () => {
      onSaved()
    },
    queryKeys: [LICENSES_QUERY_KEY, DASHBOARD_QUERY_KEY],
  })

  const form = useForm({
    defaultValues: {
      expiresAt: toDateInputValue(license.expiresAt),
      renewalCycleMonths: toRenewalCycleOptionValue(license.renewalCycleMonths),
    },
    validators: { onChange: editLicenseSchema },
    onSubmit: async ({ value }) => {
      await submit(() =>
        updateLicense({
          expiresAt: value.expiresAt,
          licenseId: license.id,
          renewalCycleMonths: Number(value.renewalCycleMonths),
        })
      )
    },
  })

  return (
    <form
      className="mt-4 flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="expiresAt">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Expiration date"
          >
            <Input
              id="edit-license-expires-at"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              required
              type="date"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="renewalCycleMonths">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Renewal cycle"
          >
            <Select
              aria-label="Renewal cycle"
              id="edit-license-renewal-cycle"
              onValueChange={(value) =>
                field.handleChange(value as RenewalCycleOptionValue)
              }
              options={RENEWAL_CYCLE_OPTIONS}
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
            <Button disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
