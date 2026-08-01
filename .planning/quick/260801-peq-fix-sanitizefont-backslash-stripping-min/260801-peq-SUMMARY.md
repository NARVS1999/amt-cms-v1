---
phase: 260801-peq
plan: 01
subsystem: ui, security
tags: [nextjs, css-injection, sanitize, zod, validation, a11y, contact-form]

# Dependency graph
requires:
  - phase: 05
    provides: contact form page, ThemeProvider theme-vars injection, shared ContactRequestSchema
provides:
  - sanitizeFont quote-escape fix (T-04-01 regression closed)
  - single-client-validation-path contact form with accessible error state
affects: [verify-work UAT, future theme/contact maintenance]

# Tech tracking
tech-stack:
  added: []
  patterns: ["filter-then-escape ordering for CSS value sanitization", "noValidate + Zod inline errors + aria-invalid/aria-describedby form pattern"]

key-files:
  created: []
  modified:
    - apps/frontend/components/ThemeProvider.tsx
    - apps/frontend/app/(public)/contact/page.tsx
    - apps/frontend/e2e/contact-form.spec.ts

key-decisions:
  - "Reorder sanitizeFont to filter character class before escaping quotes — escaping backslash can no longer be stripped"
  - "Add noValidate to contact form so Zod inline errors are the single visible client validation path (matches admin/footer JS-first pattern)"
  - "Keep required/type=email for assistive-tech semantics and mobile keyboard; wire aria-invalid + aria-describedby since native validation UI is suppressed"
  - "e2e test names/comments updated to document Zod-based blocking; assertions unchanged (identical observable behavior)"

patterns-established:
  - "Pattern: CSS value sanitization must escape AFTER filtering so injected escape sequences survive"

requirements-completed: [FR-7, FR-8, FR-9]

coverage:
  - id: D1
    description: "sanitizeFont emits font values with single quotes escaped (O\\'Reilly) so the theme :root CSS string can never break out"
    requirement: FR-7
    verification:
      - kind: other
        ref: "grep -F \"'').replace(/'/g\" apps/frontend/components/ThemeProvider.tsx (filter-before-escape order present in file)"
        status: pass
      - kind: other
        ref: "node -e escape-survival check for input O'Reilly (charCodeAt(1)===92 backslash, charCodeAt(2)===39 quote)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit && npm run build in apps/frontend"
        status: pass
    human_judgment: false
  - id: D2
    description: "Contact form validates via Zod inline errors only (noValidate); native browser tooltips never appear; error state exposed via aria-invalid/aria-describedby"
    requirement: FR-8
    verification:
      - kind: other
        ref: "grep -c noValidate \"app/(public)/contact/page.tsx\" (2 occurrences: attribute + comment)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit && npm run build in apps/frontend"
        status: pass
    human_judgment: true
    rationale: "The behavioral claim 'no native browser tooltip at any point' requires a browser to verify. Playwright e2e specs were updated to document Zod-based blocking but were not executed in this quick task (no dev server / browser run). Verifier should run the e2e suite or spot-check the form in a browser."

# Metrics
duration: 10min
completed: 2026-08-01
status: complete
---

# Phase 260801-peq: sanitizeFont Backslash Stripping + Contact Form Validation Alignment Summary

**sanitizeFont quote-escape fix (filter-before-escape reorder closes the T-04-01 CSS-injection regression) and contact form aligned to a single Zod inline-validation path with accessible error state (noValidate + aria-invalid/aria-describedby)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-01T10:26:00Z
- **Completed:** 2026-08-01T10:35:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `sanitizeFont` now filters the character class **before** escaping single quotes — the escaping backslash can no longer be stripped, so `O'Reilly` emits as `O\'Reilly` and crafted injection values like `abc' ) { ... }` can never break out of the quoted `--font-body`/`--font-heading` CSS string (regression of T-04-01 closed).
- Contact form carries `noValidate`; `ContactRequestSchema.safeParse` in `handleSubmit` is now the single visible client-side validation path (aligned with the shared-schema authority pattern across the admin panel and the JS-validated footer newsletter form).
- `required`/`type="email"` kept for assistive-tech semantics and mobile email keyboard; each input now wires `aria-invalid` + `aria-describedby` to id'd error paragraphs (`name-error`, `email-error`, `message-error`) so the suppressed native validation UI is replaced by an accessible equivalent.
- e2e spec's two stale "native validation" test names/comments renamed to document Zod-based blocking; assertions unchanged — identical observable behavior (empty/invalid input never reaches `fetch`, `apiCalled` stays false).
- `npx tsc --noEmit` and `npm run build` (22 static pages, including `/contact`) pass. API contract untouched — `packages/shared/src/schemas/contact.ts` not modified (AD-3).

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix sanitizeFont backslash stripping in ThemeProvider** - `07d46ad` (fix)
2. **Task 2: Align contact form to single Zod validation strategy** - `21af28e` (feat)

**Plan metadata:** docs commit handled by the quick-task orchestrator (Step 8).

## Files Created/Modified

- `apps/frontend/components/ThemeProvider.tsx` - `sanitizeFont` reordered to filter-then-escape; comment updated to match
- `apps/frontend/app/(public)/contact/page.tsx` - `noValidate` on form; `aria-invalid`/`aria-describedby` on name/email/message inputs; id'd error paragraphs
- `apps/frontend/e2e/contact-form.spec.ts` - two test names/comments updated from "native validation" to "Zod validation"; assertions unchanged

## Decisions Made

- Reorder `sanitizeFont` replaces per plan (filter first, escape second) — the minimal two-call fix with no other behavior change (`sanitizeCssValue`, `FALLBACK_THEME`, `buildCssVars`, template lines untouched).
- `noValidate` + kept `required`/`type="email"` + aria wiring, exactly as specified — `handleSubmit` and field styling untouched.

## Deviations from Plan

### Auto-fixed Issues

None - plan executed as written.

### Out-of-scope discovery (NOT auto-fixed)

**1. [Scope boundary - Pre-existing] `npm run lint` is unrunnable in this repo**
- **Found during:** Task 1/2 verification (`npm run lint` gate)
- **Issue:** The frontend `lint` script is `next lint`, a command **removed in Next.js 16** (repo runs Next 16.2.10). Additionally, no ESLint toolchain is installed anywhere in the repo — `eslint` and `eslint-config-next` are absent from `apps/frontend/package.json` and from `node_modules` (root and workspace). This is pre-existing and unrelated to this plan's changes.
- **Fix:** Not auto-fixed. Repair requires adding the ESLint toolchain (package install — excluded from auto-fix rules) plus a script update (toolchain change, Rule 4 territory). The runnable gates (`npx tsc --noEmit`, `npm run build`) both pass; `next build` itself runs the TypeScript check and generated all 22 pages successfully.
- **Files modified:** none
- **Verification:** `npx tsc --noEmit` PASS, `npm run build` PASS, `npm run lint` FAILS with "next lint: Invalid project directory" (command removed)
- **Logged:** `deferred-items.md` in phase directory + `.planning/WINDOWS.md` ledger entry #1 (`unrun-verify`)

---

**Total deviations:** 0 auto-fixed; 1 out-of-scope discovery deferred
**Impact on plan:** No impact on shipped code. The lint gate is a repo-wide pre-existing gap that blocks lint verification for every plan, not just this one.

## Issues Encountered

- `npm run lint` fails before reaching any file: `next lint` was removed in Next.js 16 and eslint is not installed (details above). Resolved by running the runnable gates and documenting the gap; no code change warranted within this quick-fix scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Theme CSS injection guard is functional again (quote escape survives sanitization).
- Contact form validation is single-path (Zod) with accessible error announcements — ready for e2e re-run if desired.
- Open: ESLint toolchain installation for `npm run lint` (pre-existing, tracked in WINDOWS.md #1).

---
*Phase: 260801-peq*
*Completed: 2026-08-01*

## Self-Check: PASSED

- `apps/frontend/components/ThemeProvider.tsx` — FOUND (contains `return val.replace(/[^a-zA-Z\s'-]/g, '').replace(/'/g, "\\'") || fallback;`)
- `apps/frontend/app/(public)/contact/page.tsx` — FOUND (noValidate, aria-invalid, aria-describedby verified via diff)
- `apps/frontend/e2e/contact-form.spec.ts` — FOUND (Zod validation test names verified)
- Commit `07d46ad` (Task 1) — FOUND in git log
- Commit `21af28e` (Task 2) — FOUND in git log
- `npx tsc --noEmit` — PASS; `npm run build` — PASS (22 static pages)
- `packages/shared/src/schemas/contact.ts` — NOT modified (API contract unchanged, AD-3)

