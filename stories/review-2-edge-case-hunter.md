# Edge Case Hunter — Story 1.2 Code Review

> Invoke the `bmad-review-edge-case-hunter` skill on this diff.

## Diff to Review

The changes are between commit `7bd5c82` and `HEAD` (57283f2). Same files as described in `review-1-blind-hunter.md`.

## Edge Cases to Analyze

### Auth Flow
- What happens if `localStorage` is unavailable (private browsing, SSR)?
- What happens if token is malformed/expired?
- What happens if `/api/login` returns 500?
- What happens if `/api/login` times out (network failure)?
- What happens on double-submit of login form?
- What happens if user navigates directly to `/admin` without token — does the layout flash before redirect?
- What happens on simultaneous login from multiple tabs?
- What happens if logout API call fails (server down) — is token still cleared?

### Admin Layout
- What happens on very narrow viewport (< 768px) — sidebar overflow?
- What happens with very long navigation labels (i18n future)?
- What happens when many nav groups exist — scroll behavior?
- Does focus trapping work on mobile?

### Login Page
- What happens with XSS in error messages?
- What happens with password manager autofill race conditions?
- What happens with extremely long email/password values?
- What happens if `setToken` throws?
- What happens if `router.push('/admin')` fails?

### Media Page
- What happens if upload exceeds 2MB?
- What happens if upload is interrupted?
- What happens if media list is very large (1000+ items)?
- What happens if thumbnail URL is broken?
- What happens on upload of non-image file types?
- What happens on concurrent delete of same item?

### API Routes
- What happens with unauthenticated access to `/api/media`?
- What happens with missing Sanctum token format?
- What happens on API route mismatch?
- What happens with CORS preflight?

### Token Storage
- Risks of `localStorage` vs httpOnly cookie approach
- Token persistence after browser close
- Token refresh mechanism (or lack thereof)
