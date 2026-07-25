# Plan 02-02: Expansion — Sort Order Controls + Toast Integration + Form Validation Polish

**Status:** ✓ Complete  
**Date:** 2026-07-26  
**Wave:** 2

## Summary

End-to-end slice delivering sort order up/down controls on all admin tables, dedicated bulk reorder API endpoints, `useToast()` integration on all admin pages, and inline validation error display below form fields.

## Tasks Executed

| # | Task | Status |
|---|------|--------|
| 1 | Add `sort_order` column to `marketing_pages` table (migration, model, resource, SPEC) | ✓ |
| 2 | Add reorder endpoints to all 4 controllers (Service, TeamMember, PricingPlan, Page) + routes | ✓ |
| 3 | Add frontend reorder API functions (`lib/admin-api.ts`) | ✓ |
| 4 | Add sort-order up/down controls to all 4 admin tables | ✓ |
| 5 | Integrate `useToast()` on services, team, pages, and pricing-plans pages | ✓ |
| 6 | Add inline validation error display to all admin forms | ✓ |
| 7 | Add feature tests for reorder endpoints | ✓ |

## Files Modified

- `apps/backend/database/migrations/2026_07_26_000001_add_sort_order_to_marketing_pages_table.php` — new migration
- `apps/backend/app/Models/Page.php` — added `sort_order` to `$fillable`, `$casts`
- `apps/backend/app/Http/Resources/Api/PageResource.php` — added `sort_order` to output
- `apps/backend/app/Http/Controllers/Api/ServiceController.php` — added `reorder()`
- `apps/backend/app/Http/Controllers/Api/TeamMemberController.php` — added `reorder()`
- `apps/backend/app/Http/Controllers/Api/PricingPlanController.php` — added `reorder()`
- `apps/backend/app/Http/Controllers/Api/PageController.php` — added `adminReorder()`
- `apps/backend/routes/api.php` — 4 new reorder routes inside `auth:sanctum`
- `docs/SPEC.md` — updated marketing_pages schema, PageData interface, added reorder endpoints
- `apps/frontend/lib/admin-api.ts` — added `reorderServices()`, `reorderTeamMembers()`, `reorderPricingPlans()`, `reorderPages()`, added `sort_order` to `PageData`
- `apps/frontend/app/admin/services/page.tsx` — sort controls, toast, validation errors
- `apps/frontend/app/admin/team/page.tsx` — sort controls, toast, validation errors
- `apps/frontend/app/admin/pages/page.tsx` — sort controls, toast, validation errors, new Sort column
- `apps/frontend/app/admin/pricing-plans/page.tsx` — sort controls, toast, validation errors
- `packages/shared/src/schemas/page.ts` — added `sort_order` to PageSchema
- `apps/backend/tests/Feature/ServicesTest.php` — 3 new reorder tests
- `apps/backend/tests/Feature/TeamMembersTest.php` — 3 new reorder tests
- `apps/backend/tests/Feature/PricingPlansTest.php` — 3 new reorder tests
- `apps/backend/tests/Feature/PagesTest.php` — 3 new reorder tests

## New API Endpoints (all auth:sanctum)

| Method | URI | Controller Method |
|--------|-----|-------------------|
| POST | `/api/services/reorder` | `ServiceController@reorder` |
| POST | `/api/team/reorder` | `TeamMemberController@reorder` |
| POST | `/api/pricing-plans/reorder` | `PricingPlanController@reorder` |
| POST | `/api/admin/pages/reorder` | `PageController@adminReorder` |

## Verification Results

| Check | Result |
|-------|--------|
| `php artisan test --filter=ServicesTest` | 6/6 passed (51 assertions) |
| `php artisan test --filter=TeamMembersTest` | 11/11 passed (66 assertions) |
| `php artisan test --filter=PricingPlansTest` | 11/11 passed (42 assertions) |
| `php artisan test --filter=PagesTest` | 10/10 passed (67 assertions) |
| `npx tsc --noEmit` (frontend) | Passed (no type errors) |
| `npm run build` (frontend SSG) | Passed (14 pages generated) |

## Design Decisions

- **Bulk reorder endpoint pattern:** Single `POST /api/{resource}/reorder` with `{ ids: [...] }` — sets `sort_order` to array index. Simple, idempotent, atomic.
- **Optimistic UI for reorder:** Swap items immediately in local state, then call API. On failure, reload from server to reset.
- **3 test methods per resource:** Happy path (reorder), 401 without token, validation error for missing `ids`.
- **Validation errors:** Caught at `e.status === 422`, mapped from Laravel `{ field: ["msg"] }` format to `Record<string, string>` using first error per field. Cleared on field change and form open/close.
- **Toast integration:** All 4 pages now consistently show "Saved." / "Created." / "Deleted." success toasts, and "Save failed" / "Delete failed" / "Reorder failed" error toasts.
