---
name: task
description: Work on a liscet GitHub issue. Reads the issue, explores the codebase, implements the Behavior / Architecture / TypeScript acceptance criteria, then commits and pushes. Use when starting or resuming a ticket.
---

Accepts a bare GitHub issue number (e.g. `42` or `#42`). Strip any leading `#`.

## Find the issue

```
gh issue view <N> --repo trroev/liscet --json number,title,body,milestone,labels
```

After fetching, state the milestone + labels back to the user in one line so they can confirm this is the right ticket before any work begins.

## Before writing any code

1. Read the full issue — Description, Acceptance Criteria (**Behavior** / **Architecture** / **TypeScript**), Dependencies.
2. For every `#N` referenced in the Dependencies section, run:
   ```
   gh issue view <N> --repo trroev/liscet --json number,state,title
   ```
   Surface any still-open blockers to the user before proceeding.
3. Explore the codebase to ground the work in current state — do not ask the user to explain what exists.
4. If any acceptance criteria are genuinely ambiguous, ask first — otherwise proceed.

## Do the work

Work through the criteria in order. The three subsections are a checklist:

- **Behavior** — runtime/user-observable outcomes. These must hold when the feature is exercised.
- **Architecture** — layering, colocation, and import-boundary rules. Follow `CLAUDE.md` → "Import boundaries" and "Package structure".
- **TypeScript** — conventions enforced by Biome and documented in `CLAUDE.md` → "TypeScript" (e.g. `type` not `interface`, no `enum`, `Array<T>`, `import type`, named exports, kebab-case filenames).

When adding a dependency to a workspace package, scope the install: `pnpm add <pkg> --filter <package>`.

## Before committing

1. If a Payload collection under `packages/payload/src/collections/**` was edited, run `pnpm generate:types` from `apps/web` and stage the resulting `packages/payload/src/types/payload-types.ts`. CI will fail the build otherwise — see `CLAUDE.md` → "Payload types".
2. Run `pnpm typecheck` and `pnpm lint` from the repo root. Fix any failures before continuing.
3. If test files were touched or added, run `pnpm test`.

## Commit and close

1. Invoke the `commit` skill (the project's default commit workflow). Include `Closes #<N>` in the commit message body so GitHub auto-closes the issue on push.
2. **Never** bypass the pre-commit hook with `git commit --no-verify` — fix the underlying lint or type error instead.
3. `git push`
4. Belt-and-suspenders close:
   ```
   gh issue close <N> --repo trroev/liscet --comment "All acceptance criteria met."
   ```
