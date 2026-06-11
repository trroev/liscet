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
import { formatSlug, validateSlugFormat } from "../../lib/slug"
import type {
  CheckSlugAvailabilityResult,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
} from "../../lib/types"

const TOTAL_STEPS = 3
type Step = 1 | 2 | 3

const onboardingSchema = z
  .object({
    expiresAt: z.iso.date("Enter a valid expiration date."),
    issuedAt: z.iso.date("Enter a valid issue date."),
    licenseNumber: z.string().trim().min(1, "Enter your license number."),
    licenseOption: z.enum(
      LICENSE_OPTION_VALUES as ReadonlyArray<LicenseOptionValue>,
      "Select a state and license type."
    ),
    slug: z
      .string()
      .refine(
        (value) => validateSlugFormat(value) === null,
        "Enter a valid URL."
      ),
  })
  .refine((data) => Date.parse(data.expiresAt) > Date.parse(data.issuedAt), {
    message: "Expiration date must be after the issue date.",
    path: ["expiresAt"],
  })

type SlugStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; reason: "taken" | "reserved"; suggestion?: string }
  | { kind: "format-error" }

const SLUG_DEBOUNCE_MS = 400

const isLicenseOptionValue = (value: string): value is LicenseOptionValue =>
  LICENSE_OPTION_VALUES.some((option) => option === value)

export type OnboardingFormViewProps = {
  initialSlug?: string
  onCheckSlug: (slug: string) => Promise<CheckSlugAvailabilityResult>
  onNavigate: (path: string) => void
  onSubmit: (
    input: CompleteOnboardingInput
  ) => Promise<CompleteOnboardingResult>
}

export const OnboardingFormView = ({
  initialSlug = "",
  onCheckSlug,
  onNavigate,
  onSubmit,
}: OnboardingFormViewProps): React.JSX.Element => {
  const [step, setStep] = useState<Step>(1)
  const [serverError, setServerError] = useState<string | undefined>()
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ kind: "idle" })

  const form = useForm({
    defaultValues: {
      expiresAt: "",
      issuedAt: "",
      licenseNumber: "",
      licenseOption: "" as LicenseOptionValue | "",
      slug: formatSlug(initialSlug),
    },
    validators: { onChange: onboardingSchema },
    onSubmit: async ({ value }) => {
      setServerError(undefined)
      const result = await onSubmit({
        expiresAt: value.expiresAt,
        issuedAt: value.issuedAt,
        licenseNumber: value.licenseNumber,
        licenseOption: value.licenseOption as LicenseOptionValue,
        slug: value.slug,
      })
      match(result)
        .with({ status: "success" }, ({ data }) => {
          onNavigate(`/${data.userSlug}`)
        })
        .with({ status: "error" }, ({ code, message, suggestion }) => {
          if (
            code === "SLUG_TAKEN" ||
            code === "SLUG_RESERVED" ||
            code === "SLUG_INVALID"
          ) {
            setSlugStatus({
              kind: "unavailable",
              reason: code === "SLUG_RESERVED" ? "reserved" : "taken",
              suggestion,
            })
            setStep(1)
            return
          }
          setServerError(message)
        })
        .exhaustive()
    },
  })

  const slug = useStore(form.store, (state) => state.values.slug)
  const licenseOption = useStore(
    form.store,
    (state) => state.values.licenseOption
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (slug.length === 0) {
      setSlugStatus({ kind: "idle" })
      return
    }
    if (validateSlugFormat(slug) !== null) {
      setSlugStatus({ kind: "format-error" })
      return
    }
    setSlugStatus({ kind: "checking" })
    debounceRef.current = setTimeout(() => {
      onCheckSlug(slug).then((result) => {
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
  }, [slug, onCheckSlug])

  const acceptSuggestion = (suggestion: string): void => {
    form.setFieldValue("slug", formatSlug(suggestion))
  }

  const canAdvance = match(step)
    .with(1, () => slugStatus.kind === "available")
    .with(2, () => isLicenseOptionValue(licenseOption))
    .with(3, () => true)
    .exhaustive()

  const goNext = (): void => {
    if (!canAdvance) {
      return
    }
    setServerError(undefined)
    setStep((current) =>
      match<Step, Step>(current)
        .with(1, () => 2)
        .with(2, () => 3)
        .with(3, () => 3)
        .exhaustive()
    )
  }

  const goBack = (): void => {
    setServerError(undefined)
    setStep((current) =>
      match<Step, Step>(current)
        .with(1, () => 1)
        .with(2, () => 1)
        .with(3, () => 2)
        .exhaustive()
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <StepProgress current={step} total={TOTAL_STEPS} />
        {match(step)
          .with(1, () => (
            <div className="space-y-2">
              <h1 className="font-display text-heading-md text-text-primary">
                Choose your URL
              </h1>
              <p className="font-sans text-body-sm text-text-muted">
                This becomes your account's home — every screen lives under it,
                like{" "}
                <span className="text-text-secondary">
                  liscet.com/{slug || "your-name"}
                </span>
                .
              </p>
            </div>
          ))
          .with(2, () => (
            <div className="space-y-2">
              <h1 className="font-display text-heading-md text-text-primary">
                Select your license
              </h1>
              <p className="font-sans text-body-sm text-text-muted">
                Pick the state and license type you'll be tracking CEUs for.
              </p>
            </div>
          ))
          .with(3, () => (
            <div className="space-y-2">
              <h1 className="font-display text-heading-md text-text-primary">
                License details
              </h1>
              <p className="font-sans text-body-sm text-text-muted">
                Enter your license number and its issue and expiration dates.
              </p>
            </div>
          ))
          .exhaustive()}
      </header>

      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (step < TOTAL_STEPS) {
            goNext()
            return
          }
          form.handleSubmit()
        }}
      >
        {step === 1 && (
          <form.Field name="slug">
            {(field) => (
              <Field
                error={
                  field.state.meta.isTouched
                    ? field.state.meta.errors[0]?.message
                    : undefined
                }
                label="Account URL"
              >
                <Input
                  autoComplete="off"
                  id="slug"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(formatSlug(event.target.value))
                  }
                  placeholder="your-name"
                  required
                  type="text"
                  value={field.state.value}
                />
                <SlugStatusLine
                  onAcceptSuggestion={acceptSuggestion}
                  status={slugStatus}
                />
              </Field>
            )}
          </form.Field>
        )}

        {step === 2 && (
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
        )}

        {step === 3 && (
          <>
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required
                      type="date"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </>
        )}

        {serverError && (
          <p
            aria-live="polite"
            className="font-sans text-body-sm text-destructive"
            role="alert"
          >
            {serverError}
          </p>
        )}

        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button onClick={goBack} type="button" variant="outline">
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button className="flex-1" disabled={!canAdvance} type="submit">
              Continue
            </Button>
          ) : (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  className="flex-1"
                  disabled={!canSubmit || isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Setting up…" : "Finish"}
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>

        <p className="font-sans text-body-sm text-text-muted">
          Liscet helps you track CEUs. You are responsible for verifying
          compliance with your state board.
        </p>
      </form>
    </section>
  )
}

type StepProgressProps = {
  current: number
  total: number
}

const StepProgress = ({
  current,
  total,
}: StepProgressProps): React.JSX.Element => (
  <div className="space-y-2">
    <p className="font-sans text-body-sm text-text-muted">
      Step {current} of {total}
    </p>
    <div aria-hidden="true" className="flex gap-1.5">
      {Array.from({ length: total }, (_, index) => index + 1).map(
        (stepIndex) => (
          <span
            className={
              stepIndex <= current
                ? "h-1 flex-1 rounded-full bg-accent"
                : "h-1 flex-1 rounded-full bg-border"
            }
            key={stepIndex}
          />
        )
      )}
    </div>
  </div>
)

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
