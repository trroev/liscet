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

None.

`formatConstraints: []`

## Provider caps

Caps keyed to the course's *approving body* (accrediting organization), modeled
via `providerCaps` — orthogonal to delivery `CourseFormat`.

| Kind | Approving bodies | Value | Notes |
| --- | --- | --- | --- |
| `max-fraction` | APA, NBCC, NHA, ANCC, ACCME | 0.25 | Up to 25% of the total may come from programs approved by these bodies. |

```ts
providerCaps: [
  {
    kind: "max-fraction",
    approvingBodies: ["APA", "NBCC", "NHA", "ANCC", "ACCME"],
    fraction: 0.25,
  },
]
```

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
