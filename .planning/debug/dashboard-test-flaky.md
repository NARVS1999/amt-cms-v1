---
status: diagnosing
trigger: |
  dashboard.spec.ts tests 2 and 4 fail consistently in full-suite Playwright runs
  but pass in isolation. Tests 2 and 4 show login page with empty form fields
  after fill() calls succeed, suggesting a race condition or state leak.
created: 2026-07-26
updated: 2026-07-26
---

## Symptoms

- **Expected behavior:** Test logs in with admin@example.com/password, navigates to dashboard, passes assertions.
- **Actual behavior:** Login form fields appear empty in snapshot after fill() calls, URL stays at /admin/login (test 2) or waitForURL resolves but page is back on login (test 4).
- **Error messages:** Test 2: `toHaveURL` timeout — URL stays at /admin/login for 10s. Test 4: `getByText(/total services/i)` not found — page shows login form.
- **Timeline:** Pre-existing flaky test. Present since dashboard.spec.ts was introduced (commit 964ec5c).
- **Reproduction:** Run full Playwright suite: `npx playwright test`. Tests 2 and 4 fail after being preceded by blog-posts (3 logins) + crud-feedback (4 logins).

## Evidence

- **Timestamp:** 2026-07-26
- **Finding:** Page snapshot for test 2 shows login form with empty email/password fields. fill() calls complete without error (test doesn't timeout on fill), but fields are empty.
- **Finding:** Test passes in isolation but fails when run after other test files with login flows. This is a test isolation/cumulative state issue.
- **Finding:** The mock for `/api/admin/stats` is set up before login in test 4. If the mock intercepts requests during preloading or another lifecycle event before stats are fetched, it may cause unexpected behavior.
- **Root cause hypothesis (test 2):** `expect(page).toHaveURL()` polls, while `page.waitForURL()` listens for navigation events. When preceded by many login attempts, the rate limiter (even with the fix, dev server hasn't been restarted) might cause delayed or missed navigation events that polling misses.
- **Root cause hypothesis (test 4):** The `/api/admin/stats` mock is set up before login. During the login→dashboard→redirect sequence, the Next.js router might navigate to the dashboard before the route mock is fully active, causing `fetchAdminStats()` to hit the real backend. If the real backend returns an error (e.g., the token from a previous test was invalidated), the dashboard redirects to login.

## Current Focus

- **Hypothesis:** Test isolation issue exacerbated by rate limiter (dev server not restarted after fix) and fragile navigation assertions.
- **Next action:** Apply two fixes: (1) change `expect(page).toHaveURL()` to `page.waitForURL()` in test 2 for deterministic navigation tracking; (2) set up `/api/admin/stats` mock AFTER login and before dashboard navigation, using `page.goto()` with the mock active in test 4.
