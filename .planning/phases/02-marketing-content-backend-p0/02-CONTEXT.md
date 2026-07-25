# Phase 2: Marketing Content Backend (P0) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin frontend CRUD pages for four content types: Services, Pricing Plans, Team Members, and Pages/Site Sections. Backend (models, controllers, migrations, resources, API endpoints) already exists from Phase 1 scaffold — this phase builds the admin panel UI for each content type.

Covers: Service admin form (icon, title, description, featured toggle, sort), Pricing Plan admin form (name, price, interval, features inline, popular toggle, CTA), Team Member admin form (name, role, bio, photo upload, social links, sort), Page admin form (title, slug, hero heading/subtext, JSON sections editor, publish toggle).

Admin forms reuse shadcn components from `components/ui/` and follow Phase 01.1 patterns (loading states, toasts, form feedback, destructive confirmations).

</domain>

<decisions>
## Implementation Decisions

### Team Member Photo Upload
- **D-01:** Upload happens directly in the team member form — NOT via the media library browser. File input on the form, Spatie handles `addMedia()` on save.
- **D-02:** Explicit remove button + separate upload for replacement. Uploading a new photo does NOT auto-replace the old one — user must remove first, then upload.
- **D-03:** Empty/placeholder state shows a generic avatar icon (Lucide `User` icon in a circle).
- **D-04:** Photo constraints are recommended-only (show guidance e.g., "Recommended: 400x400px, JPEG/PNG/WebP"). No hard file size enforcement beyond what Spatie defaults allow.

### Claude's Discretion
The following areas were identified but not discussed in detail. Claude has flexibility to choose standard/reasonable approaches:

- **Page Sections Schema & Editor:** What section types go in the `sections` JSON column? SPEC defines `hero_heading`/`hero_subtext` on the page model. Sections likely contain content blocks (text, CTA, features, etc.). Recommend structured form fields over raw JSON editor. Add to `docs/SPEC.md` if defining section schemas.
- **Pricing Plan Features UI:** Features are 1:N in a separate table. Recommend inline dynamic rows in the plan form (add/remove feature rows) rather than a separate interface. Features deleted and recreated on update per existing `store`/`update` controller logic.
- **Sort Order / Reordering:** Services and Team Members have `sort_order`. Recommend up/down arrow buttons in the admin table for simplicity. Drag-and-drop is more complex than needed for v1.
- **Service Icon Picker:** Services use Font Awesome class for icon. Recommend text input with a hint showing common FA classes. Visual icon picker is unnecessary overhead for v1.
- **Featured Service Toggle:** Simple boolean toggle in the service form. `is_featured` affects visual accent (e.g., `border-t-2` via CSS) on the public site.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API & Schema
- `docs/SPEC.md` — Database schemas, API contracts, field definitions for all models
- `docs/ERROR-HANDLING.md` §2 — Per-feature edge cases (services, team members, pricing plans, pages)

### Architecture & Conventions
- `.planning/codebase/ARCHITECTURE.md` — Route structure, controller patterns, model conventions, frontend page structure, data flow
- `.planning/codebase/CONVENTIONS.md` — Model skeleton, controller pattern, API patterns, admin-api.ts CRUD function pattern
- `.planning/codebase/STACK.md` — Dependencies, build commands, shadcn/ui components
- `.planning/codebase/INTEGRATIONS.md` — Spatie Media Library config, auth flow, queue setup

### Prior Phase Context
- `.planning/phases/01-foundation-p0/01-CONTEXT.md` — API envelope decisions, media library UI patterns, admin layout
- `.planning/phases/01.1-loading-and-progress-ui/01.1-CONTEXT.md` — Loading states, toast/skeleton/spinner components, form feedback, destructive confirmation patterns

### Design Direction
- `.claude/skills/sketch-findings-amt-v2/SKILL.md` — Validated design decisions (pulse animation, form feedback, toast behavior)
- `.claude/skills/sketch-findings-amt-v2/references/form-feedback.md` — Form feedback CSS patterns

### Project Context
- `.planning/PROJECT.md` — Project goals, architecture decisions, success metrics
- `.planning/REQUIREMENTS.md` — FR-1, FR-2, FR-4, FR-5 for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/` — shadcn primitives (button, card, input, label, table, alert-dialog, skeleton, spinner, toast) — use for all admin forms
- `lib/admin-api.ts` — Existing CRUD function pattern (`request<T>()`, 401/422 handling), follow for all new admin API functions
- `components/admin/sidebar.tsx` — Sidebar already has links to Services, Team, Pricing, Pages — no nav changes needed
- `packages/shared/src/schemas/` — Zod schemas already exist for all model types (service, team-member, page, pricing-plan) — update if API contracts change
- `components/admin/route-change-loader.tsx` — Page transition overlay from Phase 01.1
- `app/admin/dashboard/page.tsx` — Existing admin page pattern to follow

### Established Patterns
- Admin forms use `'use client'` with `useState`/`useEffect`, token from `localStorage`, CRUD via `lib/admin-api.ts`
- API response pattern: `{ "data": ... }` envelope — parse `response.data` for resource data
- Validation errors (422) rendered inline below inputs (red text, from Phase 01.1 D-12)
- Success/error toasts via `ToastProvider` + `useToast()` hook (from Phase 01.1)
- Destructive confirmations via `AlertDialog` for delete actions (from Phase 01.1)
- Button loading states with context-specific text ("Saving...") + disabled state

### Integration Points
- Admin pages at `app/admin/services/page.tsx`, `app/admin/team/page.tsx`, `app/admin/pages/page.tsx`, `app/admin/pricing-plans/page.tsx` — implement CRUD forms in these files
- API endpoints already exist: `POST/GET/PUT/DELETE /api/services`, `/api/team`, `/api/pricing-plans`, `/api/pages`, `/api/admin/pages`
- Pricing plan features endpoint: nested within plan CRUD (features array in request body per existing controller logic)
- Team member photo: Spatie upload via the form's file input — controller already has `registerMediaCollections()` and `InteractsWithMedia` trait

</code_context>

<specifics>
## Specific Ideas

No specific references beyond what's captured in decisions above — standard admin CRUD forms per existing patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Gray areas not discussed were noted as Claude's discretion above.

</deferred>

---

*Phase: 2-Marketing Content Backend (P0)*
*Context gathered: 2026-07-26*
