# Michigan — LMSW-C CE Rule Set

**Status:** 🟡 Pending partner confirmation · **Version:** 1 · **Researched:** 2026-06-08

Governing board: Michigan Dept. of Licensing and Regulatory Affairs (LARA),
Board of Social Work.

## Renewal cycle

`renewalCycleMonths: 36` — triennial; licenses renew by April 30.

## Total hours

`totalHours: 45` — completed each renewal period.

## Category minimums

| Category (`SubjectCategory`) | Min hours | Notes |
| --- | --- | --- |
| `ethics` | 5 | Each renewal period. |
| `pain-symptom-management` | 2 | May include behavior management, psychology of pain, behavior modification, stress management. |
| `human-trafficking` | 2 | Identification and response training. |

> **Open question for partner:** sources are ambiguous on whether the
> human-trafficking 2h is recurring per-cycle or a one-time requirement. Modeled
> here as a per-cycle `categoryMinimum`; if it is one-time, move it to
> `specialRequirements` with `recurrence: "one-time"`. Confirm with MI partner.

## Format constraints

| Kind | Formats | Value | Notes |
| --- | --- | --- | --- |
| `min-hours` | `live`, `in-person` | 22.5 | At least half of the 45 hours must be live/synchronous (in person or live online). |

## Special requirements

None modeled (pending the human-trafficking cadence question above).

`specialRequirements: []`

## Carry-over

No carry-over of excess hours into the next period.

`carryOverMaxHours: null`

## Record retention (informational, not evaluated)

Retain documentation of completed CE for audit; LARA guidance does not fix a
single retention window — confirm current rule with partner.

## Sources

- [Michigan LARA — Social Work CE brochure (PDF)](https://www.michigan.gov/-/media/Project/Websites/lara/healthsystemslicensing/Folder10/LARA_Social_Work_CE_Brochure_5-11.pdf)
- [Michigan LARA — Master's Social Worker Licensing Guide (PDF)](https://www.michigan.gov/lara/-/media/Project/Websites/lara/bpl/Social-Worker/Licensing-Info-and-Forms/Masters-Social-Worker-Licensing-Guide.pdf)

## Partner confirmation

- [ ] Total hours and triennial cycle confirmed
- [ ] Ethics / pain & symptom management minimums confirmed
- [ ] Human-trafficking requirement: per-cycle vs. one-time confirmed
- [ ] ≥50% live/synchronous format floor confirmed
- [ ] No carry-over confirmed
- [ ] Confirmed by: __________________ (MI partner) on __________
