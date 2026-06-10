"use client"

import { Badge } from "@repo/ui/components/Badge"
import { Button } from "@repo/ui/components/Button"
import { Field } from "@repo/ui/components/Field"
import { Input } from "@repo/ui/components/Input"
import { Select } from "@repo/ui/components/Select"
import { useForm, useStore } from "@tanstack/react-form"
import { useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import { z } from "zod"
import {
  LICENSE_OPTION_VALUES,
  LICENSE_OPTIONS,
  type LicenseOptionValue,
} from "../../lib/license-options"
import { formatSlug, SLUG_MAX_LENGTH, validateSlugFormat } from "../../lib/slug"
import type {
  CheckSlugAvailabilityResult,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
} from "../../lib/types"

const onboardingSchema = z
  .object({
    accountName: z
      .string()
      .trim()
      .min(1, "Enter an account name.")
      .max(SLUG_MAX_LENGTH * 2, "Account name is too long."),
    expiresAt: z.iso.date("Enter a valid expiration date."),
    issuedAt: z.iso.date("Enter a valid issue date."),
    licenseNumber: z.string().trim().min(1, "Enter your license number."),
    licenseOption: z.enum(
      LICENSE_OPTION_VALUES as ReadonlyArray<LicenseOptionValue>,
      "Select a state and license type."
    ),
  })
  .refine((data) => Date.parse(data.expiresAt) > Date.parse(data.issuedAt), {
    message: "Expiration date must be after the issue date.",
    path: ["expiresAt"],
  })
  .superRefine((data, ctx) => {
    if (validateSlugFormat(formatSlug(data.accountName)) !== null) {
      ctx.addIssue({
        code: "custom",
        message: "Use at least 2 letters or numbers.",
        path: ["accountName"],
      })
    }
  })

type SlugStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; reason: "taken" | "reserved"; suggestion?: string }
  | { kind: "format-error" }

const SLUG_DEBOUNCE_MS = 400

export type OnboardingFormViewProps = {
  onCheckSlug: (slug: string) => Promise<CheckSlugAvailabilityResult>
  onNavigate: (path: string) => void
  onSubmit: (
    input: CompleteOnboardingInput
  ) => Promise<CompleteOnboardingResult>
}

export const OnboardingFormView = ({
  onCheckSlug,
  onNavigate,
  onSubmit,
}: OnboardingFormViewProps): React.JSX.Element => {
  const [serverError, setServerError] = useState<string | undefined>()
  const [serverSuggestion, setServerSuggestion] = useState<string | undefined>()
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ kind: "idle" })

  const form = useForm({
    defaultValues: {
      accountName: "",
      expiresAt: "",
      issuedAt: "",
      licenseNumber: "",
      licenseOption: "" as LicenseOptionValue | "",
    },
    validators: { onChange: onboardingSchema },
    onSubmit: async ({ value }) => {
      setServerError(undefined)
      setServerSuggestion(undefined)
      const slug = formatSlug(value.accountName)
      const result = await onSubmit({
        expiresAt: value.expiresAt,
        issuedAt: value.issuedAt,
        licenseNumber: value.licenseNumber,
        licenseOption: value.licenseOption as LicenseOptionValue,
        slug,
      })
      match(result)
        .with({ status: "success" }, ({ data }) => {
          onNavigate(`/${data.userSlug}`)
        })
        .with({ status: "error" }, ({ message, suggestion }) => {
          setServerError(message)
          setServerSuggestion(suggestion)
        })
        .exhaustive()
    },
  })

  const accountName = useStore(form.store, (state) => state.values.accountName)
  const previewSlug = formatSlug(accountName)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (previewSlug.length === 0) {
      setSlugStatus({ kind: "idle" })
      return
    }
    if (validateSlugFormat(previewSlug) !== null) {
      setSlugStatus({ kind: "format-error" })
      return
    }
    setSlugStatus({ kind: "checking" })
    debounceRef.current = setTimeout(() => {
      onCheckSlug(previewSlug).then((result) => {
        if (result.status !== "success") {
          setSlugStatus({ kind: "idle" })
          return
        }
        if (result.data.available) {
          setSlugStatus({ kind: "available" })
          return
        }
        if (result.data.reason === "format") {
          setSlugStatus({ kind: "format-error" })
          return
        }
        setSlugStatus({
          kind: "unavailable",
          reason: result.data.reason ?? "taken",
          suggestion: result.data.suggestion,
        })
      })
    }, SLUG_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [previewSlug, onCheckSlug])

  const acceptSuggestion = (suggestion: string): void => {
    form.setFieldValue("accountName", suggestion)
    setServerSuggestion(undefined)
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-heading-md text-text-primary">
          Set up your account
        </h1>
        <p className="font-sans text-body-sm text-text-muted">
          Pick an account name and add your first license. Your account name
          becomes your URL — you'll land at{" "}
          <span className="text-text-secondary">
            liscet.com/{"{your-name}"}
          </span>
          .
        </p>
      </header>
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="accountName">
          {(field) => (
            <Field
              error={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : undefined
              }
              label="Account Name"
            >
              <Input
                autoComplete="off"
                id="accountName"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Your Name"
                required
                type="text"
                value={field.state.value}
              />
              <p
                aria-live="polite"
                className="font-sans text-body-sm text-text-muted"
              >
                liscet.com/{previewSlug || "your-name"}
              </p>
              <SlugStatusLine
                onAcceptSuggestion={acceptSuggestion}
                status={slugStatus}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="licenseOption">
          {(field) => (
            <Field
              error={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : undefined
              }
              label="State + license type"
            >
              <Select
                aria-label="State and license type"
                id="licenseOption"
                onValueChange={(value) =>
                  field.handleChange(value as LicenseOptionValue)
                }
                options={LICENSE_OPTIONS}
                placeholder="Select…"
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="licenseNumber">
          {(field) => (
            <Field
              error={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : undefined
              }
              label="License number"
            >
              <Input
                autoComplete="off"
                id="licenseNumber"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field name="issuedAt">
            {(field) => (
              <Field
                error={
                  field.state.meta.isTouched
                    ? field.state.meta.errors[0]?.message
                    : undefined
                }
                label="Issue date"
              >
                <Input
                  id="issuedAt"
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
                  id="expiresAt"
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
        </div>

        {serverError && (
          <p
            aria-live="polite"
            className="font-sans text-body-sm text-destructive"
            role="alert"
          >
            {serverError}
            {serverSuggestion && (
              <>
                {" Try "}
                <button
                  className="cursor-pointer"
                  onClick={() => acceptSuggestion(serverSuggestion)}
                  type="button"
                >
                  <Badge variant="muted">{serverSuggestion}</Badge>
                </button>
                .
              </>
            )}
          </p>
        )}

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Setting up…" : "Continue"}
            </Button>
          )}
        </form.Subscribe>

        <p className="font-sans text-body-sm text-text-muted">
          Liscet helps you track CEUs. You are responsible for verifying
          compliance with your state board.
        </p>
      </form>
    </section>
  )
}

type SlugStatusLineProps = {
  onAcceptSuggestion: (suggestion: string) => void
  status: SlugStatus
}

const SlugStatusLine = ({
  onAcceptSuggestion,
  status,
}: SlugStatusLineProps): React.JSX.Element | null =>
  match(status)
    .with({ kind: "idle" }, () => null)
    .with({ kind: "format-error" }, () => null)
    .with({ kind: "checking" }, () => (
      <p aria-live="polite" className="font-sans text-body-sm text-text-muted">
        Checking availability…
      </p>
    ))
    .with({ kind: "available" }, () => (
      <p aria-live="polite" className="font-sans text-body-sm text-text-muted">
        Available.
      </p>
    ))
    .with({ kind: "unavailable" }, ({ reason, suggestion }) => (
      <p
        aria-live="polite"
        className="font-sans text-body-sm text-destructive"
        role="alert"
      >
        {reason === "reserved"
          ? "That slug is reserved."
          : "That slug is taken."}
        {suggestion && (
          <>
            {" Try "}
            <button
              className="cursor-pointer"
              onClick={() => onAcceptSuggestion(suggestion)}
              type="button"
            >
              <Badge variant="muted">{suggestion}</Badge>
            </button>
            .
          </>
        )}
      </p>
    ))
    .exhaustive()
