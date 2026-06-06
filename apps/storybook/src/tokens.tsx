import type { ReactNode } from "react"

const NEUTRAL_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const

const ACCENT_STEPS = NEUTRAL_STEPS
const SAGE_STEPS = NEUTRAL_STEPS

const SEMANTIC_COLORS = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "text-primary", className: "bg-text-primary" },
  { name: "text-secondary", className: "bg-text-secondary" },
  { name: "text-muted", className: "bg-text-muted" },
  { name: "border", className: "bg-border" },
  { name: "accent", className: "bg-accent" },
  { name: "accent-hover", className: "bg-accent-hover" },
  { name: "accent-foreground", className: "bg-accent-foreground" },
  { name: "secondary", className: "bg-secondary" },
  { name: "secondary-hover", className: "bg-secondary-hover" },
  { name: "secondary-foreground", className: "bg-secondary-foreground" },
] as const

const TYPE_SCALE = [
  { name: "display", className: "text-display font-display" },
  { name: "heading-xl", className: "text-heading-xl font-display" },
  { name: "heading-lg", className: "text-heading-lg font-display" },
  { name: "heading-md", className: "text-heading-md font-display" },
  { name: "body-lg", className: "text-body-lg" },
  { name: "body", className: "text-body" },
  { name: "body-sm", className: "text-body-sm" },
  { name: "caption", className: "text-caption" },
  { name: "label", className: "text-label uppercase tracking-widest" },
] as const

const SPACING_TOKENS = [
  { utility: "p-1", px: 4 },
  { utility: "p-2", px: 8 },
  { utility: "p-3", px: 12 },
  { utility: "p-4", px: 16 },
  { utility: "p-6", px: 24 },
  { utility: "p-8", px: 32 },
  { utility: "p-12", px: 48 },
  { utility: "p-16", px: 64 },
  { utility: "p-24", px: 96 },
  { utility: "p-32", px: 128 },
  { utility: "p-40", px: 160 },
] as const

const RADIUS_TOKENS = [
  { name: "sm", px: 2 },
  { name: "md", px: 4 },
  { name: "lg", px: 8 },
  { name: "xl", px: 12 },
] as const

type SectionProps = {
  title: string
  children: ReactNode
}

const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-6">
    <h2 className="border-border border-b pb-2 font-display text-heading-md">
      {title}
    </h2>
    {children}
  </section>
)

type SwatchesProps = {
  prefix: string
  steps: ReadonlyArray<string>
}

const Swatches = ({ prefix, steps }: SwatchesProps) => (
  <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
    {steps.map((step) => (
      <div className="space-y-2" key={step}>
        <div
          className="h-24 w-full rounded-sm border border-border"
          style={{ background: `var(--color-${prefix}-${step})` }}
        />
        <p className="font-mono text-caption text-text-muted">{step}</p>
      </div>
    ))}
  </div>
)

type SemanticSwatchesProps = {
  dark?: boolean
  label: string
}

const SemanticSwatches = ({ dark = false, label }: SemanticSwatchesProps) => (
  <div
    className={`${dark ? "dark" : ""} rounded-lg border border-border bg-background p-6`}
  >
    <p className="mb-4 font-mono text-caption text-text-muted uppercase tracking-widest">
      {label}
    </p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SEMANTIC_COLORS.map((c) => (
        <div className="rounded-md border border-border p-3" key={c.name}>
          <div
            className={`${c.className} h-16 w-full rounded-sm border border-border`}
          />
          <p className="mt-2 font-mono text-caption text-text-primary">
            {c.name}
          </p>
        </div>
      ))}
    </div>
  </div>
)

export const Tokens = () => (
  <main className="min-h-screen bg-background p-8 text-text-primary">
    <div className="mx-auto max-w-5xl space-y-16">
      <header className="space-y-2">
        <p className="text-label text-text-muted uppercase tracking-widest">
          Mise Design System
        </p>
        <h1 className="font-display text-heading-xl">Design Tokens</h1>
        <p className="text-body text-text-secondary">
          Reference page for all tokens defined in{" "}
          <code className="text-body-sm">
            packages/tailwind/src/tailwind.theme.css
          </code>
          .
        </p>
      </header>

      <Section title="Color · Neutral">
        <Swatches prefix="neutral" steps={NEUTRAL_STEPS} />
      </Section>

      <Section title="Color · Accent (Terracotta)">
        <Swatches prefix="accent" steps={ACCENT_STEPS} />
      </Section>

      <Section title="Color · Secondary (Sage)">
        <Swatches prefix="sage" steps={SAGE_STEPS} />
      </Section>

      <Section title="Color · Semantic">
        <div className="grid gap-6 lg:grid-cols-2">
          <SemanticSwatches label="Light" />
          <SemanticSwatches dark label="Dark" />
        </div>
      </Section>

      <Section title="Typography · Scale">
        <div className="space-y-4">
          {TYPE_SCALE.map((t) => (
            <div
              className="flex items-baseline gap-6 border-border border-b pb-3"
              key={t.name}
            >
              <span className="w-32 shrink-0 font-mono text-caption text-text-muted">
                {t.name}
              </span>
              <span className={t.className}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing">
        <div className="space-y-2">
          {SPACING_TOKENS.map((s) => (
            <div className="flex items-center gap-4" key={s.utility}>
              <span className="w-20 shrink-0 font-mono text-caption text-text-muted">
                {s.utility}
              </span>
              <span className="w-16 shrink-0 font-mono text-caption text-text-muted">
                {s.px}px
              </span>
              <div className="h-4 bg-accent" style={{ width: `${s.px}px` }} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border Radius">
        <div className="flex flex-wrap gap-6">
          {RADIUS_TOKENS.map((r) => (
            <div className="flex flex-col items-center gap-2" key={r.name}>
              <div
                className="size-24 border border-border bg-surface"
                style={{ borderRadius: `${r.px}px` }}
              />
              <p className="font-mono text-caption text-text-muted">
                {r.name} · {r.px}px
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font Families">
        <div className="space-y-3">
          <p className="font-display text-heading-md">
            Cormorant Garamond — display
          </p>
          <p className="font-sans text-body">Manrope — sans</p>
        </div>
      </Section>
    </div>
  </main>
)
