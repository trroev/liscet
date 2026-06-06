---
name: create-gh-issue
description: Draft and (optionally) file a GitHub issue in this repository using the project's established issue structure — imperative title, Description with `Components live at …` line, Acceptance Criteria split into Behavior / Architecture (bulletproof-react) / TypeScript conventions, Dependencies section, and `priority:p0|p1|p2` + `area:*` labels. Use when the user says "create an issue", "file an issue", "open a GH issue", "draft a ticket", "new issue for X", or hands you a follow-up idea that should be tracked. Grills the user to fill gaps, infers labels and relationships from existing issues, and supports both draft-markdown-only and `gh issue create` modes. Do NOT use for: PR descriptions, commit messages, or issues on a different repository.
license: CC-BY-4.0
metadata:
  author: tmathiak@gmail.com
  version: 1.0.0
---

# Create GitHub Issue

Produce a GitHub issue that matches the structure of existing issues in this repository (`next-payload-starter`). Default mode: grill the user for missing details, draft the issue, show it for review, then ask whether to file via `gh issue create` or hand back markdown only.

## When to invoke

The user describes something they want tracked as work: a refactor, bug, follow-up, polish item, deferred concern. They may say "create an issue for X", "file this", "draft a ticket", or paste a rough idea.

Do NOT invoke for PR descriptions, commit messages, or notes that belong in code comments.

## Repository issue conventions (must match)

Every issue in this repo follows this exact shape. Reproduce it.

### Title

- Imperative mood, sentence case, no trailing period
- Concrete: name the change, not the symptom ("Throttle SiteHeader scroll listener", not "Scroll feels janky")
- May bundle two XS items with `;` separator if they ship in one PR
- No conventional-commit prefix (no `feat:`, `fix:`); titles are not commit messages

### Body template

```markdown
## Description

[2–4 paragraphs explaining the current state, why it matters, and the proposed direction. Reference bulletproof-react principles by section/number when relevant (e.g. "#9, security.md", "#2 colocation over centralization"). Reference related issues inline as `#N`.]

Components live at `path/one`, `path/two`, `path/three`.

## Acceptance Criteria

### Behavior

- [ ] [User-observable / runtime outcome 1]
- [ ] [User-observable / runtime outcome 2]
- [ ] [Test assertions if applicable]

### Architecture (bulletproof-react)

- [ ] [Structural / layering / colocation rule 1]
- [ ] [Import-boundary rule, if applicable]
- [ ] [Dependency-direction rule, if applicable]

### TypeScript conventions

- [ ] [`type` not `interface`; single-object arg pattern]
- [ ] [`as const satisfies` for constants; no `enum`]
- [ ] [`Array<T>`; no `any`; explicit return types on exports]
- [ ] [`import type`; named exports; kebab-case filenames]

## Dependencies

- [Blocking issue references as `#N` with one-line reason, OR "None"]
```

### Section rules

- **`Components live at …`** is always the last line of `## Description`. List file/dir paths, comma-separated, backtick-wrapped. Use "(or equivalent)" for paths that will be created.
- **Architecture (bulletproof-react)** section is omitted only if the change is purely a config tweak or a doc update with no architectural surface.
- **TypeScript conventions** section is omitted only if no TS files are touched.
- **Dependencies** section is always present; write "- None" when there are none.
- Use `- [ ]` task-list checkboxes inside acceptance criteria — never plain bullets.

### Labels

Exactly one priority label (required) plus one or more area labels:

- `priority:p0` — must-fix correctness or security
- `priority:p1` — architectural drift to fix soon
- `priority:p2` — polish or nice-to-have
- `area:tooling` — build, lint, CI, monorepo config
- `area:architecture` — bulletproof structure / layering
- `area:auth` — authentication flows
- `area:security` — security & authorization
- `area:testing` — test suite & fixtures
- `area:ui` — UI primitives, design system
- `area:docs` — documentation
- `area:perf` — performance

A single issue may carry both `priority:p0` and `priority:p1` when it bundles a hot-fix with a follow-up cleanup (see issue #2 as precedent) — only do this if the body itself describes two phases.

## Workflow

### Step 1 — Capture the user's raw description

Read what the user gave you. If they pasted code, a diff, or a path, treat that as context, not the description.

### Step 2 — Grill until you can fill every section

Ask focused follow-ups, one cluster at a time. Stop asking once you can write each section concretely. Do not invent acceptance criteria the user didn't validate.

Required information before drafting:

1. **What changes** — the proposed end state (one sentence you could put in the title).
2. **Why** — the motivation. Tie to a bulletproof-react principle or project convention if it fits.
3. **Where** — the files/dirs touched. This becomes the `Components live at` line. If unsure, use `Glob` or `Grep` to find them.
4. **Behavioral acceptance** — what a reviewer or test would verify at runtime.
5. **Architectural constraints** — layering, colocation, import boundaries (skip section if N/A).
6. **TS conventions in scope** — which rules from `CLAUDE.md` apply to the touched files (skip section if no TS).
7. **Blockers** — does another issue need to land first?

Use `AskUserQuestion` for multi-choice gaps (priority, scope). Use plain text questions for prose gaps (motivation, edge cases).

### Step 3 — Infer labels and relationships

**Priority** — propose based on signal, confirm with user:
- Security bug, broken correctness, blocking other work → `p0`
- Architectural drift, layering violation, missing convention → `p1`
- Polish, perf hygiene, deferred concern, docs gap → `p2`

**Areas** — derive from touched paths:
- `tooling/`, `turbo.json`, `biome.json`, `.github/`, `package.json` scripts → `area:tooling`
- Cross-feature imports, layering, folder moves, refactors → `area:architecture`
- `apps/web/src/features/auth/`, `packages/auth/` → `area:auth`
- `packages/ui/` → `area:ui`
- Test files, MSW, vitest config → `area:testing`
- Sanitization, CSRF, authz, secrets → `area:security`
- `CLAUDE.md`, `README`, `.md` files → `area:docs`
- Bundle size, runtime perf, render hygiene → `area:perf`

**Relationships** — run `gh issue list --state open --json number,title,labels,body --limit 30` and scan for:
- Same files / same `Components live at` paths → likely "Related to #N" or "Blocked by #N"
- Same area + adjacent concern → "Related to #N"
- Explicit prerequisite (e.g. "land #1 first") → "Blocked by #N" in Dependencies

Surface any matches to the user before finalizing the draft.

### Step 4 — Draft

Write the issue to a temp file at `/tmp/gh-issue-draft-<short-slug>.md` so it's easy to edit. Show the user:

1. The title
2. The full body
3. The label set
4. Any inferred relationships

### Step 5 — Confirm and file

Ask the user: **"File this with `gh issue create`, or give you the markdown to file manually?"**

If filing:

```bash
gh issue create \
  --title "Title here" \
  --label "priority:p1,area:architecture" \
  --body-file /tmp/gh-issue-draft-<slug>.md
```

Return the issue URL from the command output.

If markdown-only: print the title, labels, and body in a copy-pasteable block, then stop.

## Examples

### Example 1 — User describes a refactor

User: "I want to file an issue about extracting the avatar URL transformation logic from the Avatar primitive into a util."

Skill:
1. Confirms files: `packages/ui/src/Avatar/`, target location for the new util.
2. Asks: motivation? (layering — Cloudinary is an app concern, not a UI primitive concern → `area:architecture` + `area:ui`, p1).
3. Asks: any test changes? Any blockers?
4. Scans open issues — finds issue is closely related to #3 (profile API colocation) → adds "Related to #3" in Description.
5. Drafts title: `Lift Cloudinary URL transformation out of @repo/ui/Avatar`.
6. Drafts body with all four standard sections.
7. Confirms with user, then files via `gh issue create`.

### Example 2 — User wants a deferred polish item tracked

User: "File a p2 follow-up to add a Playwright E2E suite for auth + posts later."

Skill:
1. Confirms scope: critical paths only, not full coverage.
2. Asks: what counts as critical? (sign-in, sign-up, sign-out, post list, post detail).
3. Skips Architecture section if no layering implications, but includes TS conventions since `.spec.ts` files are added.
4. Labels: `priority:p2`, `area:testing`.
5. Dependencies: None.
6. Drafts and files.

### Example 3 — User pastes a rough idea

User: "we should sanitize lexical output before rendering — defer until lexical is actually wired up"

Skill:
1. Recognises this is a deferred issue — body must say "Deferred until …" in Description and Dependencies.
2. Grills: what tool? (DOMPurify or Payload's serializer hooks).
3. Drafts behavior criteria around XSS payload neutralisation and href scheme allowlist.
4. Labels `priority:p2`, `area:security`.
5. Files.

## Troubleshooting

### `gh issue create` errors with `unknown label`

Cause: label doesn't exist in the repo.

Solution: Run `gh label list --json name` to see available labels. If the user wants a new label, ask them to create it first via `gh label create` — do not silently drop the label or substitute another.

### User provides info that doesn't fit any acceptance-criteria section

If it's a non-functional requirement (e.g. "must not increase bundle size by more than 2kb"), add a `### Performance` (or appropriately named) subsection under Acceptance Criteria — the four standard sections are the floor, not the ceiling. Issue #6 and others extend the template when needed.

### No related issues found in scan

That's fine — write `- None` in Dependencies and skip relationship surfacing. Don't pad with weak associations.

### User can't decide priority

Default to `p2` and note in the body that priority is provisional. p2 is the safest under-call; the user can bump it on the issue later.
