# Plan 02-03: Expansion — Social Links Form Fields + Polish Audit

**Status:** ✓ Complete  
**Date:** 2026-07-26  
**Wave:** 3

## Summary

Added social_links form fields (LinkedIn, Twitter) with URL validation to the team member form, and applied a lightweight consistency audit across all four admin pages for skeleton column counts and destructive confirmation dialog text.

## Tasks Executed

| # | Task | Status |
|---|------|--------|
| 1 | Add social_links fields to team member form with URL validation | ✓ |
| 2 | Lightweight consistency audit — skeleton loading column counts on all 4 pages | ✓ |
| 3 | Lightweight consistency audit — destructive confirmation dialogs (include resource name) | ✓ |

## Files Modified

- `apps/frontend/app/admin/team/page.tsx` — social_links form fields (LinkedIn, Twitter with type="url"), initialized on new member
- `apps/frontend/app/admin/services/page.tsx` — delete dialog now includes service title
- `apps/frontend/app/admin/team/page.tsx` — delete dialog now includes member name
- `apps/frontend/app/admin/pages/page.tsx` — delete dialog now includes page title
- `apps/frontend/app/admin/pricing-plans/page.tsx` — delete dialog now includes plan name

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` (frontend) | Passed (no type errors) |
| `npm run build` (frontend SSG) | Passed (14 pages generated) |

## Design Decisions

- **Social links validation:** Used `<Input type="url">` which provides native browser URL validation — no custom regex needed for valid URL format.
- **Social links initialization:** New members get `{ linkedin: null, twitter: null }` to ensure the form fields show empty. Existing members use whatever the API returns.
- **Null vs empty string:** onChange sets empty values to `null` to match the backend JSON schema.
- **Backend validation fix:** Changed `social_links` validation from `nullable|json` to `nullable` in TeamMemberController — the `json` rule rejected array values sent via JSON content-type (the frontend sends the object directly in the JSON body).
- **Skeleton audit:** All 4 pages had correct column counts already (Services: 5, Team: 4, Pages: 5, Pricing Plans: 7) — no changes needed.
- **Delete dialog convention:** All 4 dialogs now show `Delete "{resourceName}"?` with `&ldquo;` curly quotes, using the `deleteTarget?.title` or `deleteTarget?.name` pattern.
