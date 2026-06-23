"use client"

import { Button } from "@repo/ui/components/Button"
import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { Select } from "@repo/ui/components/Select"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { DASHBOARD_QUERY_KEY } from "~/lib/query-keys"
import { FormError, useActionForm } from "~/lib/use-action-form"
import { COURSE_FORMATS, type CourseFormatValue } from "../../lib/course-format"
import { logCourseSchema } from "../../lib/schema"
import type {
  LogCourseData,
  LogCourseInput,
  LogCourseResult,
} from "../../lib/types"
import { TagInput } from "../TagInput"

const CERTIFICATE_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp"

const fieldError = (meta: {
  isTouched: boolean
  errors: ReadonlyArray<{ message?: string } | undefined>
}): string | undefined => (meta.isTouched ? meta.errors[0]?.message : undefined)

export type LogCourseFormViewProps = {
  onSubmit: (input: LogCourseInput) => Promise<LogCourseResult>
  onSuccess: () => void
}

export const LogCourseFormView = ({
  onSubmit,
  onSuccess,
}: LogCourseFormViewProps): React.JSX.Element => {
  const [certificate, setCertificate] = useState<File | null>(null)
  const { serverError, submit } = useActionForm<LogCourseData>({
    onSuccess,
    queryKeys: [DASHBOARD_QUERY_KEY],
  })

  const form = useForm({
    defaultValues: {
      completedAt: "",
      format: "" as CourseFormatValue | "",
      hours: "",
      provider: "",
      subjectCategories: [] as Array<string>,
      title: "",
    },
    validators: { onChange: logCourseSchema },
    onSubmit: async ({ value }) => {
      const parsed = logCourseSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await submit(() => onSubmit({ ...parsed.data, certificate }))
    },
  })

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="title">
        {(field) => (
          <Field error={fieldError(field.state.meta)} label="Course title">
            <Input
              autoComplete="off"
              id="title"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              required
              type="text"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="provider">
        {(field) => (
          <Field
            error={fieldError(field.state.meta)}
            label="Provider (optional)"
          >
            <Input
              autoComplete="off"
              id="provider"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              type="text"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="completedAt">
          {(field) => (
            <Field error={fieldError(field.state.meta)} label="Completion date">
              <Input
                id="completedAt"
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

        <form.Field name="hours">
          {(field) => (
            <Field error={fieldError(field.state.meta)} label="Credit hours">
              <Input
                id="hours"
                min={0.25}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                required
                step={0.25}
                type="number"
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="format">
        {(field) => (
          <Field error={fieldError(field.state.meta)} label="Format">
            <Select
              aria-label="Format"
              id="format"
              onValueChange={(value) =>
                field.handleChange(value as CourseFormatValue)
              }
              options={COURSE_FORMATS}
              placeholder="Select…"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="subjectCategories">
        {(field) => (
          <Field
            error={fieldError(field.state.meta)}
            hint="Add free-form tags. Press Enter after each one."
            label="Subject categories (optional)"
          >
            <TagInput
              aria-label="Subject categories"
              id="subjectCategories"
              onChange={field.handleChange}
              placeholder="Add a subject category…"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      <Field hint="PDF or image, up to 10 MB." label="Certificate (optional)">
        <input
          accept={CERTIFICATE_ACCEPT}
          className="block w-full font-sans text-body-sm text-text-secondary file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:font-sans file:text-body-sm file:text-text-primary hover:file:bg-background"
          id="certificate"
          onChange={(event) => setCertificate(event.target.files?.[0] ?? null)}
          type="file"
        />
      </Field>

      <FormError message={serverError} />

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Saving…" : "Log course"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
