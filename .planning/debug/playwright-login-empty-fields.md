---
status: resolved
trigger: |
  crud-feedback.spec.ts beforeEach: page.waitForURL(/\/admin\/(?!login)/) times out
  (20000ms). Snapshot shows login form with empty email/password fields and a
  Laravel 422 alert: "The email field is required. (and 1 more error)" — the form
  was submitted empty even though fill() calls succeeded. Same symptom class as
  the previously-resolved dashboard-test-flaky.md session.
created: 2026-08-01
updated: 2026-08-01
---

## Symptoms

- **Expected behavior:** Test logs in with admin@example.com/password, navigates to /admin, then the test body runs.
- **Actual behavior:** Login form fields appear empty in snapshot after fill() calls succeed; form submits with empty values; backend returns 422 "The email field is required. (and 1 more error)"; URL stays at /admin/login; waitForURL times out.
- **Error messages:** `TimeoutError: page.waitForURL: Timeout 20000ms exceeded.` (e2e/crud-feedback.spec.ts:9)
- **Timeline:** Flaky — same symptom previously documented in dashboard-test-flaky.md (resolved 2026-07-26 with a polling-only workaround: toHaveURL→waitForURL). Underlying race was never fixed. Surfaced again on 2026-08-01 in crud-feedback.spec.ts.
- **Reproduction:** Full Playwright suite `npx playwright test` — crud-feedback (4 logins in beforeEach) fails when preceded by many login flows. Passes in isolation.

## Current Focus

- **Hypothesis:** React hydration race on controlled login inputs. Playwright `fill()` sets the DOM value + dispatches input events before React finishes hydrating the controlled input; on the next commit (amplified by the admin layout's mount-time `setAuthed()` re-render at app/admin/layout.tsx:16-21), React reconciles the input back to state `''`, wiping the filled values. The form then submits blank → 422.
- **Test:** Instrument a run with a network listener to capture the POST /admin/login request body; if it contains empty email/password while fill() succeeded, the state wipe is confirmed. Secondary check: assert `toHaveValue()` immediately after fill — if values stick with the assertion (retry loop), hydration timing is the cause.
- **Expecting:** POST /admin/login with empty body fields on the failing run; `toHaveValue()` retry loop makes values persist and the test pass.
- **Next action:** gather initial evidence — reproduce with full suite, instrument request bodies

## Evidence

- **Timestamp:** 2026-08-01 (orchestrator)
- **Finding:** Login inputs are React-controlled (`value={email}` / `onChange`) — app/admin/login/page.tsx:61-81
- **Finding:** Admin layout re-renders subtree on mount via `useEffect(() => { setAuthed(isAuthenticated()); setLoaded(true); })` — fires even on /admin/login — app/admin/layout.tsx:16-21
- **Finding:** Backend validation requires email+password (AdminAuthController.php:19-21); snapshot alert shows BOTH failed → form truly submitted empty
- **Finding:** 15 e2e spec files duplicate the same login beforeEach — no shared auth helper exists
- **Finding:** Rate limiter already bypassed for local env (playwright-login-rate-limit.md fix) — not the cause
- **Finding:** Frontend dev server not running when failure observed; backend live at backend.test

- **Timestamp:** 2026-08-01 (debugger)
- **Finding:** Hypothesis confirmed — fill() writes the DOM value + dispatches input events before React hydrates the controlled input; on the next commit (amplified by the admin layout's mount-time `setAuthed()` re-render), React reconciles the input back to state `''`, wiping the filled values. The form then submits blank → 422.
- **Finding:** `__probe.spec.ts` (JS-delay probe) showed `react-keys-at-fill: -1` (no React attached at fill time) while the value was later wiped — direct evidence of the pre-hydration fill race.
- **Finding:** login-hydration.spec.ts reproduces the race deterministically (2s JS bundle delay + POST body capture): with controlled inputs the POST body arrives empty; with the fix it carries the typed credentials.

- **Timestamp:** 2026-08-01 (fix applied — user-approved)
- **Fix 1 (app-side):** app/admin/login/page.tsx — email/password inputs converted from controlled (`value`/`onChange` + useState) to uncontrolled (`defaultValue` + refs). Submit handler reads `emailRef.current?.value` / `passwordRef.current?.value`. Pre-hydration fill() values are no longer reconciled away by React state.
- **Fix 2 (test-side):** New shared helper e2e/helpers/auth.ts — `loginAsAdmin(page, { timeout })` with value-verification (`toHaveValue` after fill) + waitForURL. Refactored the 15 duplicated login blocks (10 beforeEach + 5 inline) across 14 spec files to use it. Test intent unchanged.
- **Verification (RED → GREEN):** login-hydration.spec.ts (race regression) **passed**; crud-feedback.spec.ts **4/4 passed** (was failing); full Playwright suite **79/79 passed** (5.7m, workers=1).
- **Unrelated fix surfaced by full suite:** admin-pages.spec.ts:101 `getByText('Page A')` strict-mode violation — the static description "…the first published page appears…" contains "page a" (case-insensitive substring), so the locator matched 2 elements. Pre-existing test bug (not the login race); fixed with `getByRole('cell', { name: 'Page A' })` (same class as commit fd3da7a).

## Eliminated

- **Timestamp:** 2026-08-01
- **Hypothesis:** Login rate limiter (429) — eliminated: alert shows 422 validation error, not 429; local env already has Limit::none()
- **Hypothesis:** toHaveURL polling race (dashboard-test-flaky fix) — eliminated: crud-feedback already uses waitForURL and still fails; the failure is before navigation, not a missed navigation event

## Resolution

- **root_cause:** React hydration race on the controlled login inputs — Playwright fill() set the DOM values before React hydrated; the admin layout's mount-time `setAuthed()` re-render then reconciled the inputs back to state `''`, so the form submitted empty and the backend returned 422 (fields wiped on the login page only, since public pages have no such re-render).
- **fix:** Made the login email/password inputs uncontrolled (`defaultValue` + refs) so pre-hydration values are never reconciled away, and extracted a shared `loginAsAdmin()` e2e helper (with value-verification) replacing the 15 duplicated login blocks — regression verified GREEN (login-hydration + crud-feedback), full suite 79/79.
- **why not caught:** The prior session (dashboard-test-flaky) applied a polling-only workaround (toHaveURL→waitForURL) without fixing the underlying race, and no gate covered pre-hydration fill behavior; the duplication of 15 inline login blocks masked the recurring symptom class.
- **guard:** login-hydration.spec.ts (deterministic race reproduction with POST-body capture) + the shared `loginAsAdmin()` helper whose `toHaveValue` verification fails fast if a fill value is ever wiped again.

## TDD Checkpoint

- **Timestamp:** 2026-08-01
- **RED:** login-hydration.spec.ts "submits the typed credentials even when fill() precedes hydration" — fails against controlled inputs (POST body arrives with empty credentials after the 2s JS-bundle delay reproduces the race).
- **GREEN:** After the uncontrolled-input fix, the same test passes — POST body carries `admin@example.com` / `password`. Regression confirmed via crud-feedback.spec.ts (4/4) and full suite 79/79.

## Reasoning Checkpoint

(empty)
