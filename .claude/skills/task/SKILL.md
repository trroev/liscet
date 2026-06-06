---
name: task
description: Work on a TICKET-NNN GitHub issue. Reads the issue, explores the codebase, implements acceptance criteria, then commits and pushes. Use when starting or resuming a ticket.
---

Accepts a `TICKET-NNN` identifier (e.g. `TICKET-068`) or a bare issue number (e.g. `42`).

## Find the issue

- If given `TICKET-NNN`:
  ```
  gh issue list --repo trroev/next-payload-starter --search "TICKET-NNN in:title" --state open --json number,title,body,milestone,labels
  ```
  Pick the matching result.

- If given a number:
  ```
  gh issue view <N> --repo trroev/next-payload-starter --json number,title,body,milestone,labels
  ```

## Before writing any code

1. Read the full issue — description, **Dependencies** section, acceptance criteria
2. Check the **Dependencies** section: if any referenced issues (`#N`) are still open, flag them to the user before proceeding
3. Explore the codebase to understand current state — do not ask the user to explain what already exists
4. If any acceptance criteria are genuinely ambiguous, ask before starting — otherwise proceed

## Do the work

Work through the acceptance criteria one by one.

## When all criteria are met

1. Run `pnpm typecheck` and `pnpm lint` — fix any issues before committing
2. Invoke the `commit` skill — include `Closes #<N>` in the commit message body so GitHub auto-closes the issue on push
3. Run `git push`
4. Close the issue explicitly (belt and suspenders):
   ```
   gh issue close <N> --repo trroev/next-payload-starter --comment "All acceptance criteria met."
   ```
