# Liscet — North Star

CEU tracker for mental health professionals. Helps licensees track continuing education hours against state-specific rules so they renew in good standing.

> **Disclaimer that lives in product, ToS, and renewal emails:** Liscet helps you track CEUs. You are responsible for verifying compliance with your state board.

---

## v1 scope

| Dimension                     | v1                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Pricing                       | Free                                                                                        |
| States                        | CA, MA, MI, CT, CO                                                                          |
| License types                 | CA-LCSW, MA-LICSW, MI-LMSW-C, CT-LICSW; CO = telehealth-into-CO registration attribute on a home-state license (not its own rule set) |
| User type                     | B2C, individual practitioners                                                               |
| Multi-state licenses per user | Modeled in data layer; surfaced in UI as one license at launch, multi-license shortly after |
| Course logging                | Manual entry only (no OCR, no provider catalog)                                             |
| Certificate uploads           | Yes, opaque attachment, virus-scanned, signed URLs                                          |
| Notifications                 | Email only (Resend)                                                                         |
| Auth                          | Hybrid: BetterAuth for end users, Payload auth for admins                                   |
| Light + dark mode             | Required from day one                                                                       |

**CO caveat — RESOLVED (2026-06-08, see [#1](https://github.com/trroev/liscet/issues/1)):** Liscet supports out-of-state therapists practicing telehealth **into** CO under their home-state CEUs — not a CO-specific CE requirement. Colorado's pathway for these practitioners (the "CO-registered telehealth provider" above) is the out-of-state **telehealth registration** under SB24-141 / C.R.S. § 12-30-124, open to mental health providers from 2026-01-01. It is **not** a Colorado license: the registrant keeps an active, unencumbered **home-state** credential, cannot open a CO office, and cannot see patients in person in CO. Their CE obligation therefore rides on the home-state license — Colorado's own 40-PDH biennial CE binds CO *licensees*, not these *registrants*. So "CO-registered telehealth provider" is a **telehealth-into-CO registration attribute layered on a home-state license, not a standalone CO CE rule set**; CEU tracking stays governed by the home state's rule set. Confirmed by CO partner (referred us to [Person Centered Tech — Teletherapy Practice Rules by State](https://personcenteredtech.com/teletherapy-practice-rules-by-state/) as the scope basis). Follow-up modeling tracked in [#22](https://github.com/trroev/liscet/issues/22).

---

## Compliance posture

- **HIPAA: not applicable.** No PHI. Liscet tracks practitioner PII (name, email, license info, certificates). To keep it that way: no free-form note fields, no client-identifying data accepted anywhere.
- **CCPA + GDPR: comply globally** regardless of user location. Privacy policy generated via Termly or iubenda. Subprocessor list maintained at `/legal/subprocessors`.
- **Minimal PII surface.** Collect only what the product requires. No DOB, no phone, no address.

---

## Tech stack

| Layer                | Choice                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Framework            | Next.js (App Router), React, TypeScript                                    |
| Styling              | TailwindCSS + semantic design tokens                                       |
| Components           | Base UI primitives, wrapped in `packages/ui`                               |
| Storybook            | Co-located in `packages/ui`                                                |
| Backend / CMS        | Payload 3.x (embedded in Next.js app)                                      |
| Database             | Postgres on Neon (`@payloadcms/db-postgres`)                               |
| Auth (end users)     | BetterAuth                                                                 |
| Auth (admins)        | Payload built-in                                                           |
| File storage         | Vercel Blob via `@payloadcms/storage-vercel-blob`                          |
| Virus scan           | ClamAV or VirusTotal in Media `beforeChange` hook                          |
| Email                | Resend + React Email templates (`packages/emails`)                         |
| Scheduled jobs       | Vercel Cron (daily)                                                        |
| Validation           | Zod                                                                        |
| Client data fetching | TanStack Query (mutations + dashboard reads)                               |
| Server data          | Server components + server actions                                         |
| Monorepo             | Turborepo (repo `trroev/liscet`, bootstrapped from `next-payload-starter`) |
| Lint/format          | Biome via ultracite (personal project)                                     |
| Hosting              | Vercel                                                                     |
| Domain               | `liscet.com` (TESS clear, available — purchase pending)                    |

---

## Monorepo layout

```
apps/
  web/                      Next.js app + Payload, marketing + product + admin
packages/
  ui/                       Base UI–wrapped primitives, Storybook
  tailwind/                 Tailwind v4 config + semantic design tokens (CSS-only)
  rules-engine/             Pure functions: evaluateCourse, summarizeLicense
  emails/                   React Email templates
  db-seed/                  Idempotent seeder for local + preview branches
```

**Hard rule:** `packages/ui` contains design-system primitives only. Feature components that know about domain types (License, Course, etc.) live in `apps/web/components`, never in `packages/ui`.

**Hard rule:** `packages/rules-engine` has zero Payload and zero Next.js imports. Pure TS, independently testable, swappable data source for v2.

---

## App route topology

```
app/
  (marketing)/              public, indexed: /, /about, /pricing later, /contact
  (auth)/                   /login, /signup, /forgot-password
  (app)/                    authenticated product: /app/dashboard, /app/courses, /app/licenses, /app/settings
  admin/                    Payload admin, separate auth, /admin/login
  legal/                    /legal/terms, /legal/privacy, /legal/subprocessors
```

---

## Data model

**Practitioners** — synced from BetterAuth on user creation/update via `databaseHooks`. Email is the join key. Stores timezone for display.

**Licenses** — belongs to Practitioner. `state`, `licenseType`, `licenseNumber`, `issuedAt`, `expiresAt`, `renewalCycleMonths` (default 24).

**Courses** — owned by Practitioner, not License. `title`, `provider`, `completedAt`, `hours`, `subjectCategories[]`, `format` (live | home-study | in-person), `certificate` (Media relation), `source: 'manual' | 'catalog'` (discriminator for post-v1 catalog feature).

**CourseCredits** — the join. One row per (Course × License) pair where the course counts. `creditedHours`, `creditedCategories`, `evaluatedAt`, `ruleSetVersion`. Payload collection with `admin.hidden` from non-admins, `access.create/update: () => false` from the API. Written only by the rules engine via Local API with `overrideAccess: true`.

**RuleSetVersions** — append-only log so historical evaluations stay stable when rules change mid-cycle.

**NotificationLog** — idempotency record for the daily cron. One row per (practitioner, license, notificationType, date).

### Design calls baked in

1. Courses owned by Practitioner, not License. One log, fanned out into CourseCredits across all eligible licenses by the engine.
2. CourseCredits are persisted, not derived. Dashboard reads stay fast.
3. License-centric data model from day one, even if v1 UI shows one license. Migrating later is brutal; modeling now is free.

---

## Rules engine

**Architecture: typed config + shared evaluator.** Each state's rules are TypeScript objects describing requirement shapes (totals, category minimums, accepted formats, carry-over caps). One evaluator interprets them. Rule changes are PRs reviewed by the relevant state's therapist partner.

**API:**

```ts
evaluateCourse(course, license, ruleSet): CourseCredit[]
summarizeLicense(license, credits, today, ruleSet): ProgressSummary
```

Both are pure, both live in `packages/rules-engine`.

**Evaluation triggers:**

- Course logged → `afterChange` hook on `Courses` evaluates across all active licenses, writes CourseCredits. Synchronous, inside the request. Wrapped in try/catch with Sentry; never block a user submission on an engine bug.
- License added/edited → `afterChange` hook re-evaluates all existing courses against the new license. Synchronous.
- Rule version published → manual CLI: `pnpm rules:reevaluate --state=CA --license-type=LCSW --from-version=N --to-version=N+1`. Real job runner deferred to v2.

**Dashboard summary** = pure function computed on every read, cached in TanStack Query, revalidated on mutations. Not persisted.

**Trap to avoid:** rules DSL that becomes secretly Turing-complete. Constrain the shape hard. If a state needs something unsupported, extend the shape deliberately.

---

## Auth — hybrid

- **One Postgres DB**, BetterAuth tables alongside Payload collections.
- **BetterAuth owns end-user identity.** `databaseHooks` upserts the matching Payload `Practitioners` row via Local API. Email is the join key.
- **Payload Users collection** = admins only (you + therapist partners). `/admin/login`.
- **Practitioners collection** has `auth: false`. Identity comes from BetterAuth session.
- **Access control bridge:** server components and actions read the BetterAuth session, then call Payload with `overrideAccess: false` and `user: practitionerDoc`. Row-level access enforced by Payload's access functions on `req.user`.
- **Sync hooks from day one.** Email change in BetterAuth propagates to Practitioners. User deletion cascades.

---

## Storage

- **Vercel Blob** for certificates, via Payload's storage adapter.
- **Signed URLs only**, short TTL (minutes).
- **Application-layer authorization** through Payload access functions. Storage provider is dumb bytes.
- **Virus scan on upload** in Media `beforeChange`. Reject on fail.
- **Encrypted at rest** (Vercel Blob default).

---

## Notifications

- **Daily Vercel Cron at 13:00 UTC.** Iterates licenses, computes who needs what notification today, sends via Resend.
- **Triggers:** renewal at 90/60/30/7/1 days. Category shortfall warnings inside 60 days.
- **Idempotency** via `NotificationLog` collection.
- **Templates** in `packages/emails`, React Email, type-safe props.
- **Suppression list** wired via Resend webhook from day one. Hard bounces and complaints auto-handled.
- **Timezone awareness:** store practitioner's display timezone; derive renewal cutoffs from the **license's state timezone**, not the practitioner's. Don't conflate.

---

## UI architecture

- **Semantic tokens only.** `@repo/tailwind` defines the semantic set: `background`, `surface`, `surface-raised`, `border`, `border-strong`, `text-primary`, `text-secondary`, `text-muted`, `accent` (+ `-hover`, `-foreground`), `secondary` (+ `-hover`, `-foreground`), and status colors `success` / `warning` / `info` / `destructive` (each with `-hover` + `-foreground`).
- **Tailwind + CSS variables.** `:root` and `[data-theme="dark"]` swap variable values.
- **`next-themes`** for switching. System default, three-way toggle, persisted.
- **Storybook builds every story in both themes** via toolbar addon.
- **Base UI never re-exported directly.** Always wrapped in `packages/ui` to keep the upgrade path clean.
- **Component library grows on demand.** Start with the 8–10 primitives needed for the first three screens. Add new ones only when a second consumer needs them.

---

## Design strategy

- **Design-in-code.** No Figma. Storybook + the running app are the design tool.
- **References:** Linear, Cron/Notion Calendar, Stripe Dashboard, Vercel Dashboard, Resend Dashboard, Height.app. Screenshot patterns into `design-references/` as a working mood board.
- **Aesthetic discipline:**
  - One accent color, picked once. Cool muted indigo-violet (hue 265°, max chroma 0.06) — see [Accent (v1)](#accent-v1) below.
  - Status colors used only for status, never decoration.
  - Two type sizes per screen, max three.
  - `shadow-sm` ceiling. No gradients. No illustrations.
  - Generous whitespace. Restraint is the entire aesthetic.
- **Therapist partners are usability testers**, not designers. Test each screen on preview deploys before merging.
- **First three screens, in order:** Dashboard → Log a course → Onboarding.

---

## Inspiration

**Primary reference: Linear.** Liscet should feel like Linear — dense without crowding, fast, keyboard-first, restrained. The other apps listed under [Design strategy](#design-strategy) (Cron, Stripe Dashboard, Vercel Dashboard, Resend Dashboard, Height.app) are secondary references; Linear is the one to copy when in doubt.

**Look-and-feel:**

- **High information density.** Small base type (~13–14px), tight line-height, generous horizontal padding. Tables and lists show many rows without scrolling.
- **Restraint over flourish.** No gradients, no illustrations, `shadow-sm` ceiling. Borders carry separation, not shadows.
- **Hover-revealed actions.** Row-level controls (edit, delete, archive) appear only on hover. Default rows are silent.
- **Pill aesthetic for status.** Compact, low-chroma badges. Status colors live in pills, never decoration.
- **Cool muted accent.** Already locked in [Accent (v1)](#accent-v1) — hue 265°, max chroma 0.06.

**UX:**

- **Keyboard-first.** Every primary action has a shortcut. `?` opens a shortcut overlay.
- **Cmd-K command palette.** Universal navigation + action surface. Reachable from anywhere.
- **Inline editing.** Click to edit, `Esc` cancels, `Enter` saves. Modals only for destructive confirmations.
- **Instant feedback.** Optimistic updates; spinners only for operations >200ms.
- **Right sidebar for details.** Drill-down opens a slide-in panel, not a new page. Preserves list context.
- **Skeleton states, not spinners.** Loading skeletons match final layout so the page doesn't reflow.

When designing a new screen or component, ask: *does Linear do this, and how?* If Linear has no direct analogue, fall back to the secondary references.

---

## Accent (v1)

Cool muted indigo-violet, in the Linear / Things 3 / Stripe Dashboard family. Picked for restraint-first aesthetics — at max chroma `0.06` the accent reads as a tinted gray, with hue `265°` sitting clear of every status color (destructive 27, warning 75, success 150, info 230) and the sage secondary (140).

| Token                          | Light                   | Dark                    |
| ------------------------------ | ----------------------- | ----------------------- |
| `--semantic-accent`            | `oklch(0.55 0.06 265)`  | `oklch(0.70 0.049 265)` |
| `--semantic-accent-hover`      | `oklch(0.46 0.053 265)` | `oklch(0.79 0.039 265)` |
| `--semantic-accent-foreground` | `--color-neutral-50`    | `--color-neutral-900`   |

The full `--color-accent-{50..900}` scale is the source of truth in [`packages/tailwind/src/tailwind.theme.css`](../packages/tailwind/src/tailwind.theme.css).

---

## Environments

- **Three environments:** local, preview (per-PR), production. No long-lived staging.
- **Per-PR Neon branches** via Neon's Vercel integration. `DATABASE_URL` injected per preview automatically.
- **Seed strategy:** `packages/db-seed` is idempotent, generates one practitioner per state with realistic licenses + courses. `NODE_ENV === 'production'` guard hard-aborts.
- **Secrets:** Vercel env vars. Revisit Doppler when there are collaborators.
- **Branch protection on `main`** with required checks: type-check, lint, test (when adopted), Storybook build.

---

## Observability

- **Sentry** (`@sentry/nextjs`). Free tier. Wire `Sentry.setUser({ id: practitionerId })` and `Sentry.setContext('license', { state, licenseType })` in every server action and Payload hook. Explicit `captureException` around rules-engine calls.
- **Axiom** for structured logs via Vercel log drain. Two saved queries pinned day one: "cron job failures" and "rules engine errors."
- **PostHog** for product analytics + session replay + in-app feedback widget. Mask all input fields and certificate filenames by default.
- **No separate uptime monitor.** Vercel + Sentry alerts are enough.

---

## Testing

Adopt as we go: **Vitest** for unit (rules engine first — that's where bugs cost the most), **Playwright** for end-to-end on the critical paths (signup → add license → log course → see dashboard update). Not blocking v1 launch.

---

## Legal

- **ToS + Privacy + Cookie policy** via Termly or iubenda. Lawyer review pre-launch if budget allows.
- **"Not a substitute for state board verification" disclaimer** surfaced in: ToS, onboarding, footer of renewal emails.
- **Self-serve account deletion.** Settings → confirm with password → soft-delete 30 days → hard-delete via cron, cascading to all related rows + Vercel Blob certificates.
- **Self-serve data export.** Single button generates JSON dump, emailed as signed download link.
- **Subprocessors list** maintained at `/legal/subprocessors` with last-updated date.

---

## Marketing surface

- **Single Next.js app.** Marketing on `/`, product on `/app/*`, admin on `/admin`.
- **SEO baseline:** `generateMetadata` per page, one `@vercel/og` template for OG images, `sitemap.ts` + `robots.ts`, `SoftwareApplication` JSON-LD on landing.
- **Long-tail target keywords:** "LCSW CEU tracker California", "LICSW continuing education tracker Massachusetts", etc. Not the bare word "Liscet."

---

## Support

- **PostHog in-app feedback widget** (captures session replay automatically).
- **`hello@liscet.com` mailbox.**
- **48-hour response commitment** for the first 6 months. Therapist communities talk; reputation forms in the first 100 users.
- **No public roadmap yet.** Add Productlane/Featurebase/Canny once there are 100+ active users with clear demand signals.

---

## v2 and post-v1 backlog

- **Migrate rules engine to CMS-driven (Payload collections).** Therapist partners edit state rules without a deploy. Evaluator logic unchanged; data source swapped.
- **Certificate PDF parsing / OCR** to prefill course entry forms.
- **Provider catalog** of known CE providers and courses. Search-and-pick rather than typing. `source: 'manual' | 'catalog'` discriminator in `Courses` already supports this.
- **Multi-state UI** — surface multiple licenses per practitioner.
- **Additional license types** per state (data layer already supports arbitrary types).
- **Real job runner** (Inngest or Trigger.dev) for rule-version reevaluations and per-user-local-time notifications.
- **B2B tier** — group practices, seat billing, admin dashboards. Requires Stripe and tenancy model.
- **SMS notifications** via Twilio (10DLC registration required).
- **OAuth / passkey login** via BetterAuth providers.
- **Public roadmap and changelog.**

---

## Open items blocking next steps

| Item                                                                      | Blocks                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Domain purchase (`liscet.com`)                                            | Resend setup, marketing pages, OG template, email sender config |
| First-license-type rule sets authored with each state's therapist partner | Rules engine config files, dashboard design pass                |

**Resolved:** name locked to Liscet; USPTO TESS clear (Class 9 + Class 42); `liscet.com` available; repo bootstrapped at `trroev/liscet` from `next-payload-starter`; accent color locked to cool muted indigo-violet (hue 265°, max chroma 0.06); CO scope resolved to telehealth-into-CO registration under home-state CEUs (a license attribute, not a CO rule set — see [CO caveat](#v1-scope) and follow-up [#22](https://github.com/trroev/liscet/issues/22)).

---

## Decision log summary

| #   | Decision            | Choice                                                               |
| --- | ------------------- | -------------------------------------------------------------------- |
| 1   | v1 scope            | B2C, free, 5 states × 1 license each                                 |
| 2   | HIPAA               | Not applicable; avoid via no free-form note fields                   |
| 3   | Multi-state model   | License-centric from day one                                         |
| 4   | Rules engine        | Typed config + shared evaluator; CMS-driven in v2                    |
| 5   | Course entry        | Manual only; OCR + catalog deferred                                  |
| 6   | Storage             | Vercel Blob via Payload; virus-scanned                               |
| 7   | Backend             | Payload 3 embedded in Next.js                                        |
| 8a  | Database            | Postgres on Neon                                                     |
| 8b  | Auth                | Hybrid: BetterAuth (users) + Payload (admins)                        |
| 9   | Monorepo            | Turborepo, single app + shared packages                              |
| 10  | Data model          | Practitioners / Licenses / Courses / CourseCredits / RuleSetVersions |
| 11  | Notifications       | Resend + Vercel Cron, email-only                                     |
| 12  | Evaluation triggers | Sync `afterChange` hooks + manual reeval CLI                         |
| 13  | UI split            | `packages/ui` primitives, `apps/web/components` features             |
| 14  | Design strategy     | Design-in-code, no Figma, free references                            |
| 15  | Light + dark        | Both from day one, semantic tokens                                   |
| 16  | Environments        | Local + per-PR previews + prod; Neon branching                       |
| 17  | Observability       | Sentry + Axiom + PostHog                                             |
| 18  | Legal               | Termly/iubenda; self-serve delete + export                           |
| 19  | Marketing           | Single app, route-grouped sections                                   |
| 20  | Name                | Liscet (TESS clear, `liscet.com` available)                          |
| 21  | Support             | PostHog widget + `hello@` mailbox                                    |
| 22  | Accent color        | Cool muted indigo-violet, hue 265°, max chroma 0.06                  |
| 23  | Design inspiration  | Primary: Linear (look-and-feel + UX); secondary references kept      |
| 24  | CO scope            | Defers to home-state CEUs; telehealth-into-CO registration attribute, not a rule set |
