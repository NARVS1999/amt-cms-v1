# Concerns

## Technical Debt

### Missing Admin Contact Management (FR-11 deferred)

Contact messages are stored in the database but have no admin panel to view them. Currently only accessible via email notification. Flagged as v1.1 in the PRD (`docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md`).

### No Frontend Tests

The frontend (`apps/frontend/`) has zero tests — no test runner configured, no component tests, no E2E. Only linting (`next lint`) provides any quality feedback. Risk of regressions in the admin panel.

### Limited Backend Test Coverage

Backend tests only cover public GET endpoints. Admin CRUD (POST/PUT/DELETE behind `auth:sanctum`) has no test coverage. Validation rules, authentication failures, and error states are untested.

### No Input Sanitization for Rich Content

The Quill editor stores HTML in blog post content. The readiness report (`docs/implementation-readiness-report-2026-07-18.md`) flags the absence of HTMLPurifier or equivalent sanitization as a risk (NFR-8 gap).

### Inline Validation in Controllers

All request validation happens inline in controller methods rather than in dedicated FormRequest classes. This works but makes validation logic harder to reuse and test independently.

### Hardcoded Stats Fallback

`GET /api/admin/stats` returns hardcoded `blog_posts: 0` until the BlogPost model exists (noted in `AGENTS.md`). The `safeCount()` helper wraps queries in try/catch — a fragile pattern that masks real DB errors.

## Security

- Sanctum token stored in `localStorage` — vulnerable to XSS. Acceptable for a static-site admin panel where the attack surface is limited.
- No CSRF protection on API routes (Sanctum token serves as the anti-CSRF mechanism for the SPA-style admin).
- No rate limiting on admin login beyond a generic throttle — brute force protection is basic.

## Performance

- Spatie Media Library image conversions run synchronously (`QUEUE_CONNECTION=sync`) unless configured otherwise. Large uploads block the response.
- All public data fetched at build time — no caching layer between Laravel and the Next.js build. Build-time API calls could be slow if the database has many records.
- No pagination on any GET endpoint — all records returned in a single response. Fine for small datasets but will break with scale.

## Fragile Areas

- **Static export path:** The frontend uses `next.config.ts` with `output: 'export'`. Any dynamic feature (like search or pagination) would require a server-side component, which conflicts with the SSG-only architecture.
- **Legacy code:** The `legacy/` directory contains an old Bootstrap 4 static site (`index.html`, 755 lines). Not in use but may cause confusion about which codebase is authoritative.
- **Database prefix conventions:** Tables use inconsistent prefixes (`billing_`, `marketing_`, `contact_`, `media_`). Future resources need to follow the pattern but there's no central registry.
- **SQLite in dev vs MySQL in prod:** Migrations must work on both. Any MySQL-specific features (JSON column operators, full-text indexes) would break the dev environment.

## Known Gaps (from Implementation Readiness Report)

| ID | Concern | Status |
|----|---------|--------|
| MC-1 | Quill auto-save admin form interaction | Design concern — address during Story 4.1 |
| MC-2 | NFR-4 (CI/CD pipelines) missing story coverage | Minor |
| MC-3 | Quill admin form interaction | Design concern |
| — | No Accessibility audit coverage | Risk of gaps |
| — | Story numbering gap (1.2 intentionally removed) | Cosmetic |
