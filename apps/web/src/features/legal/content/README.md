# Legal content (privacy policy / terms of service)

`privacy-policy.ts` and `terms-of-service.ts` are **generated** from Termly's
free static HTML export, exposed as a single `export const … = \`…\`` string and
rendered by `LegalDocument` via `dangerouslySetInnerHTML`. Do **not** hand-edit
the markup — it is regenerated on every Termly change.

## Updating a policy

1. Edit the policy in Termly, then **ADD TO WEBSITE → HTML Format** (the static
   export — _not_ the paid `data-id` embed).
2. Strip the leading `<style>` blocks (they hard-code Arial/black with
   `!important` and fight the `.legal-document` rebrand in `globals.css`):

   ```sh
   perl -0777 -i -pe 's/<style>.*?<\/style>//gs' <file>.html
   ```
3. **HTML5-normalize the markup** (see below), then save it as the template
   literal: `export const PRIVACY_POLICY_HTML = \`<normalized html>\``.
   Confirm the content has no backtick or `${` before wrapping it.

## Why normalization is mandatory

Termly's export contains malformed nesting (e.g. unclosed
`<span style="font-size:…">` inside `<bdt>`). The browser silently repairs this
when it parses the page, so the live DOM's `innerHTML` no longer byte-matches
the string React injected on the server → **hydration mismatch** (the whole
subtree is thrown away and re-rendered on the client, with a console error).

The fix is to store HTML that is already a **parse → serialize fixed point**:
feed the markup through an HTML5 parser once and store what comes back, so the
browser has nothing left to "correct".

`jsdom` is present in the dependency tree (transitively). Normalize with a
throwaway script — set the markup as a container's `innerHTML` and read it back:

```js
import { JSDOM } from "jsdom"
const dom = new JSDOM("<div id='c'></div>")
const c = dom.window.document.getElementById("c")
c.innerHTML = rawHtml          // the style-stripped export
const normalized = c.innerHTML // <- store this
```

(Equivalently, paste the markup into a real browser: set it as a detached
`div.innerHTML`, read `div.innerHTML` back. The browser's serializer is the
source of truth.)

To verify, the stored string must satisfy `div.innerHTML === stored` after
`div.innerHTML = stored` — no remaining divergence.
