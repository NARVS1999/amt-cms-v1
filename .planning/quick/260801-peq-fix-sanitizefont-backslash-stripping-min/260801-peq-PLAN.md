---
phase: 260801-peq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/frontend/components/ThemeProvider.tsx
  - apps/frontend/app/(public)/contact/page.tsx
  - apps/frontend/e2e/contact-form.spec.ts
autonomous: true
requirements: [FR-7, FR-8, FR-9]
must_haves:
  truths:
    - "Theme font values emitted into CSS escape single quotes so no malformed CSS string can be produced from a font value."
    - "The contact form uses exactly one client-side validation strategy — Zod inline errors — and native browser validation UI never appears."
    - "Contact form inputs remain accessible (aria-invalid + aria-describedby) after native validation UI is suppressed."
  artifacts:
    - "apps/frontend/components/ThemeProvider.tsx — sanitizeFont applies the character filter before the quote escape."
    - "apps/frontend/app/(public)/contact/page.tsx — form carries noValidate; inputs carry aria-invalid/aria-describedby."
  key_links:
    - "sanitizeFont output → --font-body/--font-heading string in buildCssVars (escaped backslash must survive into the injected :root style tag)."
    - "ContactRequestSchema.safeParse → validationErrors inline rendering (the single visible client validation path, native path blocked)."
---

<objective>
Two focused maintenance fixes from the post-ship quality pass.

**Fix 1 — `sanitizeFont` backslash stripping (minor, security-adjacent):** In `apps/frontend/components/ThemeProvider.tsx` the `sanitizeFont` function escapes single quotes BEFORE running the character-class filter. The filter's allowed class `[a-zA-Z\s'-]` does not include backslash, so the escaping backslash is stripped immediately — leaving the quote unescaped in the emitted CSS. A font value like `O'Reilly` produces `--font-body: 'O'Reilly', sans-serif;` (malformed CSS string), and the escaping that mitigated the T-04-01 CSS-injection threat is defeated. Fix is a two-call reorder: filter first, then escape.

**Fix 2 — contact form validation strategy alignment:** `apps/frontend/app/(public)/contact/page.tsx` currently runs BOTH native browser validation (`required`, `type="email"`) and Zod client-side validation (`ContactRequestSchema.safeParse`). Native validation fires first — the browser blocks submit with unstyled tooltips before `handleSubmit` runs — so the styled Zod inline errors for required/empty/format-invalid fields are effectively unreachable, and the two layers show inconsistent messages. Align to the project's established JS-first strategy (shared Zod schema is the validation authority, same as the admin panel; the footer newsletter form is already JS-validated): add `noValidate` to the form so Zod inline errors become the single visible client-validation path, keep `required`/`type="email"` for assistive-tech semantics and mobile email keyboard, and wire `aria-invalid`/`aria-describedby` since native validation UI (and its built-in screen-reader announcements) is suppressed. Update the e2e spec's stale "native validation" naming so artifacts document the aligned strategy.

Purpose: Close both known quality gaps without disturbing the shipped API contract or SSG architecture (AD-2/AD-3).
Output: Fixed `ThemeProvider.tsx`, aligned contact page + e2e spec naming.
</objective>

<execution_context>
@C:/Users/Admin/.config/opencode/gsd-core/workflows/execute-plan.md
@C:/Users/Admin/.config/opencode/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/PROJECT.md
@apps/frontend/components/ThemeProvider.tsx
@apps/frontend/app/(public)/contact/page.tsx
@apps/frontend/e2e/contact-form.spec.ts
@packages/shared/src/schemas/contact.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix sanitizeFont backslash stripping in ThemeProvider</name>
  <files>apps/frontend/components/ThemeProvider.tsx</files>
  <action>
    In `sanitizeFont` (currently line 29-33 of `apps/frontend/components/ThemeProvider.tsx`), reorder the two `.replace()` calls so the character-class filter runs FIRST and the single-quote escape runs SECOND:

    Current (buggy): `return val.replace(/'/g, "\\'").replace(/[^a-zA-Z\s'-]/g, '') || fallback;`
    Fixed: `return val.replace(/[^a-zA-Z\s'-]/g, '').replace(/'/g, "\\'") || fallback;`

    Why: the escape step introduces a backslash, and the filter's allowed class `[^a-zA-Z\s'-]` strips backslashes — so today the escaping backslash is deleted, the quote survives unescaped into the emitted CSS (`--font-body: 'O'Reilly', sans-serif;` breaks the string), and the quote-escape that mitigated the T-04-01 CSS-injection risk is defeated. With the reorder, a value like `O'Reilly` yields `O\'Reilly` and the wrapped `'...'` CSS string is valid; a crafted value like `abc' ) { ... }` is filtered to `abc'` then escaped to `abc\'` — the quote can never break out of the CSS string.

    Do NOT change `sanitizeCssValue`, `FALLBACK_THEME`, `buildCssVars`, or the `--font-body`/`--font-heading` template lines. Keep the function's fallback behavior (`|| fallback` when the filter empties the value). Keep the inline comment accurate to the fixed order.
  </action>
  <verify>
    <automated>grep -F "'').replace(/'/g" apps/frontend/components/ThemeProvider.tsx && node -e "const esc=v=>v.replace(/'/g,()=>String.fromCharCode(92)+String.fromCharCode(39));const strip=v=>v.replace(/[^a-zA-Z\s'-]/g,'');const fixed=v=>strip(v).replace(/'/g,esc)||'Poppins';const out=fixed(\"O'Reilly\");if(out.length!==9||out.charCodeAt(1)!==92||out.charCodeAt(2)!==39){console.error('FAIL',out);process.exit(1)}console.log('PASS escaped quote survives')"</automated>
    <automated>Run in apps/frontend: npx tsc --noEmit && npm run lint && npm run build</automated>
  </verify>
  <done>
    The grep finds the fixed call order (filter-before-escape) in the file; the node check confirms the escaped quote survives (char code 92 at index 1) for input `O'Reilly`; the full frontend typecheck, lint, and SSG build all pass.
  </done>
</task>

<task type="auto">
  <name>Task 2: Align contact form to single Zod validation strategy</name>
  <files>apps/frontend/app/(public)/contact/page.tsx, apps/frontend/e2e/contact-form.spec.ts</files>
  <action>
    In `apps/frontend/app/(public)/contact/page.tsx` (the public contact form):

    1. Add `noValidate` to the `<form>` element (line 133, `<form onSubmit={handleSubmit} className="space-y-6">`) so native browser constraint validation never fires — its tooltips are unstyled, show inconsistent messages, and currently run BEFORE `handleSubmit`, making the styled Zod inline errors for required/empty fields unreachable. With `noValidate`, `ContactRequestSchema.safeParse` in `handleSubmit` becomes the single visible client-side validation path (per the shared-schema authority pattern used across the admin panel, and matching the already-JS-validated footer newsletter form).
    2. KEEP the `required` attributes and `type="email"` on the three inputs — with `noValidate` they no longer trigger native UI but retain `:required`/aria-required semantics for assistive tech and the email keyboard on mobile. Do not remove them.
    3. Wire accessible error state, since native validation UI (and its built-in announcements) is now suppressed: give each error paragraph an id (`name-error`, `email-error`, `message-error`), add `aria-invalid={Boolean(validationErrors.name)}` (and email/message) to the corresponding input, and add `aria-describedby` on each input pointing to its error id.
    4. Do NOT change `handleSubmit` (Zod parse, fetch to `${API_URL}/contact`, 201/422/429 handling, success banner) or the field/error styling. Do NOT touch the newsletter form in `components/Footer.tsx` (out of scope — already JS-validated).

    In `apps/frontend/e2e/contact-form.spec.ts`: update the stale mechanism descriptions so the spec documents the aligned strategy — rename test "does not submit when required fields are empty (native validation)" and "does not submit with invalid email (native type=email validation)" to describe Zod-based blocking (e.g. "(Zod validation)"), and adjust their comments accordingly. The assertions themselves stay unchanged: with `noValidate`, empty fields and invalid email are still rejected client-side by `ContactRequestSchema.safeParse` before `fetch` is called, so `apiCalled` remains false and the thank-you banner never appears — identical observable behavior, different mechanism.
  </action>
  <verify>
    <automated>grep -c noValidate "app/(public)/contact/page.tsx"</automated>
    <automated>Run in apps/frontend: npx tsc --noEmit && npm run lint && npm run build</automated>
  </verify>
  <done>
    The form element carries `noValidate`; each input has `aria-invalid` wired to its Zod validation error and `aria-describedby` to its error paragraph; the e2e spec's two "native validation" test names/comments now describe Zod-based validation; typecheck, lint, and SSG build all pass.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| admin API → ThemeProvider → client CSS | Theme font values returned by the admin theme API cross into an injected `<style>` tag; sanitizeFont is the only guard (regression of T-04-01) |
| user → contact form → API | Untrusted form input crosses from the browser into the contact submission pipeline |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260801-01 | Tampering | ThemeProvider.sanitizeFont | medium | mitigate | Reorder replaces so quote escaping runs after the character filter — the escaping backslash can no longer be stripped, keeping the CSS string closed (fixes the T-04-01 regression). |
| T-260801-02 | Spoofing | Contact form client validation | low | accept | Client-side Zod validation is UX only; the Laravel API remains the validation authority server-side (422 + error banner path unchanged). |
</threat_model>

<verification>
- Run the full frontend gate after both tasks: `npx tsc --noEmit && npm run lint && npm run build` in `apps/frontend`.
- Confirm `packages/shared/src/schemas/contact.ts` was NOT modified (API contract unchanged per AD-3).
</verification>

<success_criteria>
- A font value containing a single quote is emitted into the theme CSS with the quote escaped (`O\'Reilly`), and crafted injection-shaped values cannot break out of the quoted CSS string.
- Submitting the empty/format-invalid contact form shows the styled Zod inline errors immediately; no native browser tooltip appears at any point.
- The contact form's error state is exposed via aria attributes (screen-reader accessible).
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass.
</success_criteria>

<output>
Create `.planning/quick/260801-peq-fix-sanitizefont-backslash-stripping-min/260801-peq-SUMMARY.md` when done
</output>
