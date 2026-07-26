---
phase: 03
plan: 01
subsystem: backend + admin-frontend
tags: [api, blog, sanitization, ux]
key-files:
  created: []
  modified:
    - apps/backend/app/Http/Controllers/Api/BlogPostController.php
    - apps/backend/app/Http/Resources/Api/BlogPostResource.php
    - apps/backend/routes/api.php
    - apps/backend/tests/Feature/BlogPostsTest.php
    - apps/frontend/app/admin/blog-posts/page.tsx
    - apps/frontend/lib/admin-api.ts
    - apps/backend/composer.json
    - apps/backend/composer.lock
metrics:
  tests: 14
  test_status: passing
---

# Summary: Plan 03-01 — Blog Admin API + Content Sanitization + Admin UX Polish

## What Was Built

Completed the blog backend foundation: fixed public endpoint to filter published-only with `published_at desc` sorting, added admin endpoint returning all posts (drafts + published), implemented HTMLPurifier content sanitization on store/update, added sort_order swap endpoint, and polished the admin blog page with sort controls, reading time estimate, auto-save indicator, and excerpt auto-generation.

## Commits

| Task | Hash | Description |
|------|------|-------------|
| 1-5 | f9db107 | feat(03-01): blog admin API, HTMLPurifier sanitization, sort order, admin UX polish |

## Deviations

- Used `require_once` for HTMLPurifier autoloading in controller (library uses file-based includes, not PSR-4)
- Factory default `is_published: false` required updating all existing tests to explicitly create published posts

## Self-Check: PASSED

- `php artisan test --filter=BlogPostsTest` — 14 tests, 63 assertions, all passing
- `npx tsc --noEmit` — no type errors
- Public endpoint filters published-only ✓
- Admin endpoint returns all posts with auth ✓
- Content sanitized via HTMLPurifier ✓
- Sort order swap works ✓
- Admin UX: sort arrows, reading time, auto-save, excerpt auto-gen ✓
