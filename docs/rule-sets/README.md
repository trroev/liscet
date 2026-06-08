# Rule sets

Human-readable source of truth for each state's continuing-education (CE)
requirements. Every file here maps **1:1** onto the `RuleSet` TypeScript type in
[`packages/rules-engine/src/types/RuleSet`](../../packages/rules-engine/src/types/RuleSet/index.ts).
A documented set is encoded into a typed config object (issues #20 / #21) only
**after** it is confirmed with that state's therapist partner.

## Status legend

| Badge | Meaning |
| --- | --- |
| 🟡 | **Pending partner confirmation.** Researched from state-board sources, not yet signed off by the state's therapist partner. Do not encode into a config. |
| ✅ | **Confirmed.** Reviewed and signed off by the state's therapist partner; safe to encode. |

> Liscet helps practitioners track CEUs but is not a substitute for verifying
> compliance with your state board. These docs are a best-effort reading of
> public board guidance and must be partner-confirmed before they drive evaluation.

## Field mapping

Each state doc uses fixed section headings that correspond directly to `RuleSet`
fields, so the markdown and the type never drift:

| Doc section | `RuleSet` field | Notes |
| --- | --- | --- |
| Header line (state / license) | `state`, `licenseType` | |
| `Version` in header line | `version` | Increments when rules change; old versions stay valid via `RuleSetVersions`. |
| Renewal cycle | `renewalCycleMonths` | Length of one renewal period in months. |
| Total hours | `totalHours` | Hours required across the full cycle. |
| Category minimums | `categoryMinimums[]` | One row per `{ category, minHours }`, recurring every cycle. |
| Format constraints | `formatConstraints[]` | `min-hours` / `max-hours` / `max-fraction` over a set of formats. |
| Special requirements | `specialRequirements[]` | Non-cycle cadence: `one-time` or `{ everyMonths }`. |
| Carry-over | `carryOverMaxHours` | `null` = no carry-over allowed. |
| Record retention | *(none)* | Informational only — how long to keep certificates. Not evaluated. |
| Sources | *(none)* | Citations for the figures above. |
| Partner confirmation | *(none)* | Sign-off checklist for the state's partner. |

Any requirement that does **not** fit a `RuleSet` field must not be jammed into
one. Surface it as an issue to extend the type deliberately — see the type's
header comment.

## v1 states

| File | State | License | Cycle | Total | Status |
| --- | --- | --- | --- | --- | --- |
| [`ca-lcsw.md`](./ca-lcsw.md) | California | LCSW | 24 mo | 36 h | 🟡 |
| [`ma-licsw.md`](./ma-licsw.md) | Massachusetts | LICSW | 24 mo | 30 h | 🟡 |
| [`mi-lmsw-c.md`](./mi-lmsw-c.md) | Michigan | LMSW-C | 36 mo | 45 h | 🟡 |
| [`ct-licsw.md`](./ct-licsw.md) | Connecticut | LICSW | 12 mo | 15 h | 🟡 |
