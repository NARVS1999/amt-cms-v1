# Plan 02-01: Tracer — Team Member Photo Upload + Route Fixes

**Status:** ✓ Complete  
**Date:** 2026-07-26  
**Wave:** 1

## Summary

End-to-end slice delivering team member photo upload/remove via dedicated endpoints, the missing pricing-plans admin route, frontend UI integration, SPEC documentation update, and feature tests.

## Tasks Executed

| # | Task | Status |
|---|------|--------|
| 1 | Add dedicated photo endpoints to TeamMemberController (removePhoto, uploadPhoto) | ✓ |
| 2 | Register photo endpoints and pricing adminIndex route in `routes/api.php` | ✓ |
| 3 | Add frontend API functions (`fetchAdminPricingPlans`, `removeTeamMemberPhoto`, `uploadTeamMemberPhoto`) and update `docs/SPEC.md` | ✓ |
| 4 | Build team photo upload/remove UI (form photo section, table thumbnails, toast integration) | ✓ |
| 5 | Fix pricing plans admin page to use `fetchAdminPricingPlans()` | ✓ |
| 6 | Add feature tests (4 TeamMembersTest + 2 PricingPlansTest) | ✓ |

## Files Modified

- `apps/backend/app/Http/Controllers/Api/TeamMemberController.php` — added `removePhoto()`, `uploadPhoto()`
- `apps/backend/routes/api.php` — 3 new routes inside `auth:sanctum` group
- `docs/SPEC.md` — §3.4 updated with photo endpoints + pricing adminIndex route
- `apps/frontend/lib/admin-api.ts` — added `fetchAdminPricingPlans()`, `removeTeamMemberPhoto()`, `uploadTeamMemberPhoto()`
- `apps/frontend/app/admin/team/page.tsx` — photo upload/remove UI, table thumbnails, toast
- `apps/frontend/app/admin/pricing-plans/page.tsx` — switched to `fetchAdminPricingPlans()`
- `apps/backend/tests/Feature/TeamMembersTest.php` — 4 new test methods
- `apps/backend/tests/Feature/PricingPlansTest.php` — 2 new test methods

## Verification Results

| Check | Result |
|-------|--------|
| `php artisan test --filter=TeamMembersTest` | 8/8 passed (59 assertions) |
| `php artisan test --filter=PricingPlansTest` | 8/8 passed (33 assertions) |
| `npx tsc --noEmit` (frontend) | Passed (no type errors) |
| `npm run build` (frontend SSG) | Passed (14 pages generated) |

## New API Endpoints

| Method | URI | Controller Method |
|--------|-----|-------------------|
| DELETE | `/api/team/{teamMember}/photo` | `TeamMemberController@removePhoto` |
| POST | `/api/team/{teamMember}/photo` | `TeamMemberController@uploadPhoto` |
| GET | `/api/admin/pricing-plans` | `PricingPlanController@adminIndex` |

## Design Decisions

- **JSON-only store/update:** Photo is never sent in store/update payloads; handled via dedicated endpoints only
- **Blocking replace guard:** UI prevents selecting a new photo if one already exists; user must remove first
- **Spatie Media Library:** Photo upload/remove goes through `addMediaFromRequest()` / `clearMediaCollection()` — no direct `Storage::put()`
- **Response shape:** All photo endpoint responses wrap `TeamMemberResource` in `$this->success()` envelope
