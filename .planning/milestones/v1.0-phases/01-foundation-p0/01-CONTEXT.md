# Phase 1: Foundation (P0) - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Auth system (Sanctum), admin login + password reset, admin dashboard with build-time SSG stats, public REST API scaffold with standardized conventions (Laravel pagination, spatie/laravel-query-builder, default error format), shared Zod schemas in `packages/shared/`, and media library admin UI (grid/list toggle, single upload, delete confirmation).

</domain>

<decisions>
## Implementation Decisions

### Admin Login UI
- **D-01:** Full-page centered login form — standard pattern, works well with SSG.
- **D-02:** Generic error messages on failed login — "Invalid email or password" only, security best practice.
- **D-03:** Forgot password / reset flow included in Phase 1 — not deferred.
- **D-04:** "Remember me" checkbox included — uses Sanctum's token expiry extension.

### Dashboard Stats
- **D-05:** Show all stat widgets: Services count, Pricing Plans count, Team Members count, Blog Posts count, Contact Messages count (unread), Subscribers count, Published Pages count.
- **D-06:** Stats fetched at build-time (SSG) — no live client-side fetching.

### API Response Conventions
- **D-07:** Laravel-style pagination using `paginate()` — includes `current_page`, `last_page`, `per_page`, `total`, `links`.
- **D-08:** Use `spatie/laravel-query-builder` for standardized sort/filter query params (`?sort=...&filter[field]=...`).
- **D-09:** Laravel default validation error format — `{ "message": "...", "errors": { "field": ["..."] } }`.

### Media Library Admin UI
- **D-10:** Grid view with list toggle — user can switch between thumbnail grid and table list.
- **D-11:** Single file upload via click-to-browse — no multi-upload or drag-and-drop in v1.
- **D-12:** Confirmation dialog before deleting media items.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Conventions
- `.planning/codebase/ARCHITECTURE.md` — System architecture, API envelope, route structure, auth flow
- `.planning/codebase/STACK.md` — Languages, frameworks, key dependencies
- `.planning/codebase/INTEGRATIONS.md` — Database, auth, file storage, email config
- `.planning/codebase/CONVENTIONS.md` — Coding conventions and patterns
- `.planning/PROJECT.md` — Project goals, non-goals, architecture decisions
- `.planning/REQUIREMENTS.md` — Full requirements listing (FR-12, FR-13, FR-14, FR-15)

### Specific Docs
- `apps/backend/config/sanctum.php` — Sanctum configuration for token auth
- `apps/backend/app/Traits/ApiResponse.php` — Existing `{ "data": ... }` envelope trait
- `apps/frontend/lib/admin-api.ts` — Existing admin API client pattern (token auth, CRUD functions)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ApiResponse` trait (`app/Traits/ApiResponse.php`) — Use `success()` and `error()` for all API responses.
- `lib/admin-api.ts` — Existing token-authenticated fetch pattern; login/logout functions follow this.
- Shared Zod schema structure (`packages/shared/src/schemas/`) — Mirror existing patterns for new schemas.

### Established Patterns
- Sanctum token auth with `localStorage` storage under `admin_token`.
- Flat Laravel structure: Models in `app/Models/`, Controllers in `Http/Controllers/Api/`, Resources in `Http/Resources/Api/`.
- SSG-only frontend (`output: 'export'`) — no server-side rendering.

### Integration Points
- `routes/api.php` — All API routes defined here; public GET outside middleware, admin CRUD inside `auth:sanctum`.
- Admin login route: `POST /api/admin/login`, logout: `POST /api/logout`.
- Media library routes: `GET /api/media`, `POST /api/media`, `DELETE /api/media/{id}`.
- Admin dashboard at `app/admin/page.tsx` with existing `stats-overview.tsx` component.

</code_context>

<specifics>
## Specific Ideas

No specific references — open to standard approaches per decisions captured above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation (P0)*
*Context gathered: 2026-07-23*
