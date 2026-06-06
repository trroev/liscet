---
name: commit
description: Stage and commit local git changes using the Conventional Commits 1.0.0 specification. Use this skill whenever the user wants to commit changes, asks to "commit", says "commit my changes", "commit this", "make a commit", "ship it", or otherwise asks Claude to create a git commit. Use this skill even when the user does not explicitly mention "conventional commits" — this is the default commit workflow.
---

# Commit

Inspect the working tree, write a Conventional Commits–compliant message, confirm with the user, and run `git commit`.

## Workflow

1. **Pre-flight checks** — bail out cleanly on any abnormal repo state (see below).
2. **Determine staging** — respect existing staging; smart-stage only when nothing is staged.
3. **Generate the message** — Conventional Commits format, scope inferred from paths.
4. **Show + wait** — print the message, wait for an explicit instruction from the user.
5. **Execute** — run `git commit` once the user confirms. Do not push.
## 1. Pre-flight checks

Run these before doing anything else. Stop and report on any of them — do not attempt to "fix" the state.

| Condition | Detection | Action |
| --- | --- | --- |
| Not in a git repo | `git rev-parse --git-dir` fails | Stop. Tell the user. |
| Detached HEAD | `git symbolic-ref -q HEAD` fails | Warn, ask before proceeding. |
| Mid-rebase/merge/cherry-pick | `.git/MERGE_HEAD`, `.git/REBASE_HEAD`, `.git/CHERRY_PICK_HEAD`, or `.git/rebase-merge/` exists | Stop. Tell the user the state and let them resolve it. |
| Clean working tree | `git status --porcelain` is empty | Stop, show `git status`, exit. |
| `.env`, `.env.*`, files matching `*secret*`, `*credential*`, `*.pem`, `*.key` staged or about to be staged | Inspect file list | Hard stop. Warn loudly. Require explicit user confirmation before continuing. |

## 2. Determine staging

Run `git status --porcelain` and `git diff --cached --stat`.

**If anything is staged:**
- Commit only what is staged. Do not touch unstaged or untracked files.
- Generate one commit message for the staged diff.
**If nothing is staged (smart-stage mode):**
- Read `git diff` for tracked changes and `git status --porcelain` for untracked files.
- Group changes into logical commits. Reasonable groupings:
  - One feature/fix per commit.
  - Lockfile churn (`pnpm-lock.yaml`, etc.) → `chore(deps): update lockfile`, or folded into the related dependency change if obvious.
  - Generated/build artifacts → separate `chore(generated):` commit.
  - Untracked files included in the proposal but flagged with `??` so the user can spot strays before approving.
- **Entangled files** (one file with changes belonging to multiple logical commits): flag the file, tell the user to split it manually with `git add -p`, do not attempt patch-mode splitting.
- Present the full grouping plan up front:
  ```
  Proposed commits:
  1. feat(auth): add credential rotation flow
     - apps/web/src/lib/auth/rotate.ts
     - apps/web/src/app/auth/rotate/page.tsx
  2. fix(forms): correct zod schema for email field
     - packages/ui/src/forms/email-input.tsx
  3. chore(deps): update lockfile
     - pnpm-lock.yaml
  ```
- One approval covers the whole sequence. Execute commits in order. If any commit fails (e.g., hook failure), stop immediately and report — do not continue to the next.
## 3. Message format

**Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

- **Type** — one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. No others.
- **Scope** — optional. Infer from paths when obvious; omit when the change spans the whole repo or no clear scope exists.
  - `apps/web/...` → `(web)`
  - `apps/api/...` → `(api)`
  - `packages/ui/...` → `(ui)`
  - `packages/<pkg>/...` → `(<pkg>)`
  - Multiple unrelated areas → omit scope.
- **Subject** — lowercase imperative ("add login flow", not "Added login flow" or "Add login flow"). No trailing period. Aim for ≤72 chars.
- **Body** — include when the change isn't self-evident from the subject. Explain *why*, not *what*. Wrap at ~72 chars. Skip for trivial commits (typo fixes, lockfile bumps, one-line changes).
- **Footer** — include when applicable:
  - `BREAKING CHANGE: <description>` for breaking changes (also prefix subject type with `!`, e.g., `feat(api)!:`).
  - `Closes #123`, `Refs #456` if the user has mentioned an issue.
**Examples:**

```
feat(auth): add credential rotation flow

Users can now rotate their API credentials from the account settings
page. Old credentials remain valid for 24 hours after rotation to allow
for graceful migration.
```

```
fix(forms): correct zod schema for email field
```

```
chore(deps): update lockfile
```

```
feat(api)!: change session token format to JWT

BREAKING CHANGE: Session tokens are now JWTs. Existing sessions will be
invalidated on deploy. Clients must re-authenticate.
```

## 4. Confirmation flow

- Print the proposed message (or full grouping plan in smart-stage mode).
- Stop and wait for an explicit instruction. Do not auto-execute on silence or assume confirmation.
- Acceptable user responses:
  - "go", "ship it", "commit", "yes", "lgtm" → execute.
  - Targeted edit ("change scope to auth", "drop the body", "make it fix not feat") → apply the surgical edit, re-show, wait again. Do not regenerate the whole message from scratch.
  - "abort", "cancel", "nvm" → stop.
## 5. Execution

- Run `git commit -m "<subject>" -m "<body>" -m "<footer>"` (separate `-m` flags per paragraph) or write the message to a temp file and use `git commit -F <file>` for multi-paragraph messages with formatting.
- Do **not** pass `-S` — respect the user's `commit.gpgsign` config.
- Do **not** pass `--no-verify`. If pre-commit hooks fail, surface the hook output verbatim and stop. Let the user decide whether to fix, bypass, or abort.
- Do **not** push. Never run `git push` from this skill.
- After a successful commit (or each commit in smart-stage mode), print the short SHA and subject:
  ```
  ✓ a3f2c91 feat(auth): add credential rotation flow
  ```

## Out of scope

- `git commit --amend`, fixup commits, interactive rebase. If the user wants to amend, they'll say so — run `git commit --amend` directly without re-running this workflow.
- Merge commits. If a merge is in progress, the pre-flight check stops the skill.
- Pushing, PR creation, branch management.
