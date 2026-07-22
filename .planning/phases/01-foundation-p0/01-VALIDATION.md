---
phase: 01
slug: foundation-p0
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-23
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | PHPUnit 11.x |
| **Config file** | `apps/backend/phpunit.xml` |
| **Quick run command** | `php artisan test --filter=ServicesTest\|StatsTest\|MediaTest\|AuthTest` |
| **Full suite command** | `php artisan test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `php artisan test --filter=<relevant test>`
- **After every plan wave:** Run `php artisan test`
- **Before verify-work:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | FR-12 | T-01-01 | Credentials never exposed in response | feature | `php artisan test --filter=AuthTest` | ❌ W0 | ⬜ pending |
| 01-02 | 01 | 1 | FR-12 | T-01-02 | Token rotation on logout | feature | `php artisan test --filter=AuthTest` | ❌ W0 | ⬜ pending |
| 01-03 | 01 | 1 | FR-13 | — | N/A | feature | `php artisan test --filter=StatsTest` | ✅ | ⬜ pending |
| 01-04 | 02 | 1 | FR-15 | — | N/A | feature | `php artisan test --filter=ServicesTest` | ✅ | ⬜ pending |
| 01-05 | 03 | 2 | FR-14 | T-01-05 | SVG script injection blocked | feature | `php artisan test --filter=MediaTest` | ✅ | ⬜ pending |
| 01-06 | 04 | 2 | FR-12, FR-13, FR-14, FR-15 | — | N/A | typecheck | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `apps/backend/tests/Feature/AuthTest.php` — auth feature tests
- [ ] Ensure `php artisan test` passes cleanly before Wave 1

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin login UI renders correctly | FR-12 | Visual layout, responsive design | Visit `/admin/login`, verify centered card layout, form fields, responsive behavior |
| Dashboard stat widgets layout | FR-13 | Visual layout, responsive grid | Visit `/admin/dashboard`, verify 4 stat cards in responsive grid |
| Media library grid/toggle | FR-14 | Visual layout, grid rendering | Visit `/admin/media`, verify grid of thumbnails, upload button, delete dialog |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
