---
phase: 02
reviewers: [agent-reviewer]
reviewed_at: 2026-07-26
plans_reviewed:
  - 02-01-PLAN.md (Tracer — Team Member Photo Upload + Route Fixes)
  - 02-02-PLAN.md (Expansion — Sort Order Controls + Toast + Validation)
  - 02-03-PLAN.md (Expansion — Social Links + Polish)
---

# Cross-AI Plan Review — Phase 2

## Agent Reviewer

### Plan 02-01 Review

**Summary:** This tracer plan correctly identifies the highest-priority gaps — team photo handling and the pricing plans admin route hole. However, it contains a fundamental AD-6 violation risk in the photo upload approach and doesn't account for how the `store()` method must handle multipart vs JSON requests.

**Strengths:**
- Correctly identifies the missing `GET /api/admin/pricing-plans` route (known bug)
- `removePhoto`/`uploadPhoto` as separate endpoints matches user decision D-02 (explicit remove before replace)
- Good tracer scope — touches backend, routes, frontend API, and UI in one vertical slice

**Concerns:**
- **HIGH — AD-6 / D-01 conflict:** D-01 says "not via media library" but Spatie is already wired into TeamMember model and is mandatory per AD-6. The plan must explicitly state Spatie will be used — otherwise an agent could bypass Spatie and violate the architecture.
- **MEDIUM — `store()` request format collision:** The current `store()` validates JSON fields. Adding photo upload means the request becomes multipart/form-data. The plan should keep `store()` JSON-only and force photo upload via the separate `POST /team/{id}/photo` endpoint.
- **MEDIUM — Missing avatar placeholder spec:** D-03 says "Lucide User icon" but doesn't specify where the fallback renders (table? edit modal?). The existing frontend table has no avatar column at all.
- **LOW — `removePhoto` response shape:** Not specified. Should return `{ "data": { "message": "Photo removed." } }` per ApiResponse pattern.

**Suggestions:**
- Keep `store()` JSON-only (as-is), require photo via separate endpoint — cleaner separation
- Be explicit: use `$teamMember->addMediaFromRequest('photo')` referencing the existing Spatie model config
- Add auth middleware check: both new photo endpoints must be inside `auth:sanctum` group
- Add `photo_url` column to the frontend team table (thumbnail avatar) so remove action has visible effect

### Plan 02-02 Review

**Summary:** Sound expansion with good existing patterns to follow. The sort order controls need a backend endpoint to persist changes — the plan omits this entirely.

**Strengths:**
- Toast integration correctly follows the blog-posts pattern
- Validation error display addresses a real UX gap
- Skeleton loading already exists on all 4 pages — standardizing is low-risk

**Concerns:**
- **HIGH — Sort order persistence is undefined:** Up/down buttons need a backend mechanism: either `PATCH /api/{resource}/{id}/sort` with `{ sort_order: number }` or a bulk `POST /api/{resource}/reorder`. Not specified risks half-implemented UI.
- **MEDIUM — Toast needs `ToastProvider` verification:** The toast component requires a `ToastProvider` wrapper in the admin layout — should verify it exists.
- **MEDIUM — 422 error shape mismatch:** The `request()` helper throws `{ status: 422, errors, message }`. Plan should confirm error structure matches field-level display.
- **LOW — Pages has no `sort_order` column:** Up/down buttons on pages table require a migration. Not mentioned.

**Suggestions:**
- Define sort persistence: recommend a reusable `PATCH` endpoint
- Add `ToastProvider` check to acceptance criteria
- Note pages `sort_order` migration should be in scope

### Plan 02-03 Review

**Summary:** A polish and gap-filling wave, but some items are already done (skeleton loading, confirmation dialogs) and others need explicit schema decisions.

**Strengths:**
- Social links fields directly address a confirmed gap
- Destructive confirmation dialogs consistency is good process hygiene

**Concerns:**
- **MEDIUM — Skeleton loading is already present:** All 4 pages already have skeleton loading. Calling this out as new work inflates effort estimates.
- **MEDIUM — Confirmation dialogs already exist:** All 4 pages already have AlertDialog for delete. If adding new dialogs (publish/unpublish?), that's not scoped.
- **MEDIUM — Sort column requires a new migration:** Pages table doesn't have `sort_order`. Adding it requires migration, controller update, and resource update.
- **LOW — Social links should specify URL validation:** The plan says "LinkedIn, Twitter" — should specify URL input types and validation behavior.

**Suggestions:**
- Remove "skeleton loading" and "confirmation dialogs" from scope since they already exist
- Add migration class name for sort_order on pages
- Add `PATCH /api/admin/pages/reorder` endpoint if up/down buttons are desired

---

## Consensus Summary

### Strengths
1. Good dependency ordering: 02-01 → 02-02 → 02-03
2. Correct gap identification: photo handling, pricing routes, social links, toast
3. Respects user decisions: D-02, D-03, D-04
4. Follows existing patterns: toast, skeleton, AlertDialog
5. Proper separation of concerns: backend, routes, API, UI each called out

### Concerns (priority ordered)
1. **HIGH — AD-6/D-01 conflict unaddressed:** Must explicitly state Spatie will be used for team photos despite D-01 wording
2. **HIGH — Sort order persistence undefined:** Up/down buttons need a backend mechanism across all 3 plans
3. **HIGH — 02-01 `store()` request format collision:** Must decide JSON-only store + separate photo endpoint
4. **MEDIUM — 02-03 scope validation gap:** Skeleton and dialogs already exist
5. **MEDIUM — Pages sort_order requires migration:** Not explicitly scoped
6. **MEDIUM — No test plan:** New endpoints need tests (photo upload/remove, pricing adminIndex)
7. **LOW — Photo endpoints not in SPEC:** New endpoints must be documented

### Suggestions
1. Resolve AD-6/D-01: Document that Spatie IS used, D-01 means "in the member form, not the Library page"
2. Define sort persistence: `PATCH /api/{resource}/{id}/sort` as reusable pattern
3. Keep `store()` JSON-only, photo via dedicated endpoint
4. Add tests for new endpoints (fold into existing plans)
5. Update SPEC.md in 02-01 with new endpoints
6. Consolidate 02-03: remove already-done items, add sort migration

### Risk Assessment
**MEDIUM** — Plans are logically structured and identify real gaps, but have HIGH-risk ambiguities (AD-6, sort persistence, store format collision). With suggestions addressed, risk drops to LOW.

---

## Consensus Summary

### Agreed Strengths
- Good dependency ordering
- Correct gap identification
- Respects user decisions

### Agreed Concerns
- AD-6 enforcement clarity needed for photo upload
- Sort persistence backend mechanism undefined
- Store request format collision needs resolution

### Divergent Views
- Scope of 02-03 polish items vs existing code state
