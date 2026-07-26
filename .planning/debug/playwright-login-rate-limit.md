---
status: resolved
trigger: |
  Playwright test `login.spec.ts >> Admin Login >> shows error on invalid credentials` fails
  because the backend returns "Too many attempts. Please try again in 60 seconds."
  instead of the expected "incorrect" credentials error.
created: 2026-07-26
updated: 2026-07-26
---

## Symptoms

- **Expected behavior:** Login with invalid credentials shows "incorrect credentials" error message.
- **Actual behavior:** Login shows "Too many attempts. Please try again in 60 seconds." rate-limit error.
- **Error messages:** `{"message":"Too many attempts. Please try again in 60 seconds."}` (from Laravel throttle middleware)
- **Timeline:** Flaky — passes when tests run in isolation, fails when many tests run sequentially.
- **Reproduction:** Run the full Playwright test suite (`npx playwright test`). The login credential error test fails when preceded by ~20+ other tests that each perform login.

## Evidence

- **Timestamp:** 2026-07-26
- **Finding:** Page snapshot confirms the login form shows rate-limit alert: `alert: Too many attempts. Please try again in 60 seconds.` The Laravel ThrottleRequests middleware (applied via `config/app.php` throttle group or `app/Http/Kernel.php` throttle middleware) limits login attempts to 5 per minute.
- **File:** The Playwright test suite has 25+ tests, most of which log in via `beforeEach` hooks — that's many login POSTs in rapid succession.
- **File:** `apps/frontend/e2e/login.spec.ts` — the failing test

## Current Focus

- **Hypothesis:** Laravel's login rate limiter (Limit::perMinute(10)→by IP) is triggered by cumulative login requests across all Playwright tests, causing the "invalid credentials" test to receive a rate-limit response instead of the expected auth-failure response.
- **Test:** Confirmed — `AppServiceProvider.php:34` configures `admin-login` rate limiter at 10/minute per IP. The route uses `->middleware('throttle:admin-login')`. The Playwright suite runs ~25+ tests, many of which log in, exhausting the 10-attempt budget.
- **Expecting:** The rate limiter blocks the 11th+ login attempt within 60 seconds, returning 429 "Too Many Attempts" instead of the 422 with "incorrect credentials" the test expects.
- **Next action:** Present fix options

## Root Cause

The Laravel `admin-login` rate limiter (`apps/backend/app/Providers/AppServiceProvider.php:34`) allows only **10 login attempts per minute per IP**. Running the Playwright test suite triggers logins across multiple test files (toast, crud-feedback, blog-posts, media-toast, route-change-loader, dashboard, login, media), each doing `beforeEach` login, quickly exhausting the 10-attempt budget. The "invalid credentials" test then receives a 429 rate-limit response instead of the 422 validation error it expects.

## Fix Applied

**Option B — Disabled rate limiting in `local` environment.**

File: `apps/backend/app/Providers/AppServiceProvider.php:34`

```php
RateLimiter::for('admin-login', function (Request $request) {
    if (app()->environment('local')) {
        return Limit::none();
    }
    return Limit::perMinute(10)->by($request->ip() ?? 'internal');
});
```

Production rate limit (10/min) remains unchanged. Only the `local` environment (where Playwright runs against the dev server) is unrestricted.

**Verification:** Full Playwright suite passes: 24/25 tests pass, only the pre-existing flaky `dashboard.spec.ts` skeleton test remains failing.
