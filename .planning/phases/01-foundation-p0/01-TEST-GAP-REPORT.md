---
phase: 01
slug: foundation-p0
generated: 2026-07-26
---

# Phase 1 — Test Gap Report

## Summary

Total backend PHP feature tests: ~116 (across 12 test classes)
Total shared package schema tests: 13 (1 file)
Total E2E browser tests: 5 (2 spec files)

## Coverage by Theme

| Theme | Tests | Status |
|-------|-------|--------|
| Auth (login/logout/me) | AuthTest: 14 tests | ✅ Comprehensive |
| Forgot/Reset Password | AuthTest (included) | ✅ Comprehensive |
| Remember Me | AuthTest: `test_remember_me_*` | ✅ Covered |
| Password hash exposure | AuthTest: `test_login_does_not_expose_password_hash` | ✅ Covered |
| Auth rate limiting | AuthTest: `test_forgot_password_rate_limiting` | ✅ Covered |
| Admin CRUD (all entities) | AdminCrudTest: 15 tests | ✅ Comprehensive |
| QueryBuilder sort/filter | QueryBuilderTest: 9 tests | ✅ Comprehensive |
| Dashboard Stats | StatsTest: 7 tests | ✅ Comprehensive |
| Public GET endpoints | ServicesTest, TeamMembersTest, BlogPostsTest, PricingPlansTest, PagesTest | ✅ Comprehensive |
| Media Library API | MediaTest: 13 tests | ✅ Comprehensive |
| Contact/Subscribe | ContactSubscribeTest: 13 tests | ✅ Comprehensive |
| Zod schemas (auth/stats/media) | shared: 13 assertions | ✅ Comprehensive |
| E2E Login UI | 3 tests | ✅ Basic |
| E2E Dashboard | 2 tests | ✅ Basic |
| E2E Media Library | Missing | ❌ Gap |

## Gaps

### 1. E2E: Media Library (`apps/frontend/e2e/media.spec.ts`)
- No browser E2E tests for the media library page
- Should test: upload button click, file picker opens, grid rendering, delete dialog

### 2. Pre-existing TypeScript error
- `apps/frontend/app/admin/pages/page.tsx:218` — `sort_order` missing from `PageData` interface
- Fix: Add `sort_order: number` to `PageData` in `apps/frontend/lib/admin-api.ts`

### 3. Backend tests cannot run locally
- PHP 8.2 not available in this dev environment
- Run `php artisan test` on a PHP-enabled machine before deployment

## Test Commands

```bash
# Backend (PHP required)
cd apps/backend && php artisan test                                      # Full suite
cd apps/backend && php artisan test --filter=AuthTest                     # Auth only
cd apps/backend && php artisan test --filter=AdminCrudTest                # Admin CRUD
cd apps/backend && php artisan test --filter=QueryBuilderTest             # QueryBuilder
cd apps/backend && php artisan test --filter=StatsTest                    # Stats

# Shared package
cd packages/shared && npx vitest run                                      # Zod schema validation

# Frontend type check
cd apps/frontend && npx tsc --noEmit                                      # TypeScript
cd apps/frontend && npm run lint                                          # ESLint
cd apps/frontend && npx playwright test                                   # E2E (requires dev server)

# Combined verification
cd apps/backend && php artisan test && cd packages/shared && npx vitest run
```
