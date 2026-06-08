# Massachusetts — LICSW CE Rule Set

**Status:** 🟡 Pending partner confirmation · **Version:** 1 · **Researched:** 2026-06-08

Governing board: Massachusetts Board of Registration of Social Workers.

## Renewal cycle

`renewalCycleMonths: 24` — biennial, keyed to the licensee's birthday.

## Total hours

`totalHours: 30` — completed each renewal period.

## Category minimums

| Category (`SubjectCategory`) | Min hours | Notes |
| --- | --- | --- |
| `clinical` | 10 | Clinical content. |
| `ethics` | 3 | Professional ethics. |
| `anti-racism` | 2 | Focus on oppression. |
| `anti-discrimination` | 1 | Oppression across protected classes (ethnicity, sex, sexual orientation, gender identity/expression, age, religion, immigration status, ability, etc.). |
| `domestic-sexual-violence` | 2 | Board-approved training in domestic and sexual violence. |

## Format constraints

| Kind | Formats | Value | Notes |
| --- | --- | --- | --- |
| `max-fraction` | (provider-based) | 0.25 | Up to 25% of the total may come from programs approved by APA, NBCC, NHA, ANCC, or ACCME. |

> **Open question for partner:** this cap is keyed to *approving body*, not delivery
> `CourseFormat`. The `max-fraction` shape models the 25% ceiling; whether the
> `formats` set is the right lever (vs. a future `approvedBody` dimension) needs
> partner confirmation. If it doesn't fit, file an issue to extend `RuleSet`
> rather than overloading `formats`.

## Special requirements

None.

`specialRequirements: []`

## Carry-over

No carry-over of excess hours into the next period.

`carryOverMaxHours: null`

## Record retention (informational, not evaluated)

Retain CE certificates for at least **2 renewal cycles (4 years)**.

## Sources

- [Mass.gov — Continuing Education Information for Social Workers](https://www.mass.gov/info-details/continuing-education-information-for-social-workers)
- [Mass.gov — Important Renewal Information (Social Workers)](https://www.mass.gov/info-details/important-renewal-information-social-workers)
- [NASW-MA — Continuing Education FAQs](https://www.naswma.org/page/CEFAQs)

## Partner confirmation

- [ ] Total hours and renewal cycle confirmed
- [ ] Clinical / ethics minimums confirmed
- [ ] Anti-racism / anti-discrimination / domestic-sexual-violence minimums confirmed
- [ ] 25% approved-provider cap confirmed (and how it should be modeled)
- [ ] No carry-over confirmed
- [ ] Confirmed by: __________________ (MA partner) on __________
