# Phase 1: Foundation (P0) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-23
**Phase:** 1-Foundation (P0)
**Areas discussed:** Admin Login UI, Dashboard Stats, API Response Conventions, Media Library Admin UI

---

## Admin Login UI

| Option | Description | Selected |
|--------|-------------|----------|
| Full-page login | Clean full-screen centered card — standard pattern, works well with SSG | ✓ |
| Modal overlay | Modal on top of dashboard — faster context switch but needs auth state check first | |
| Generic error | 'Invalid email or password' — security best practice, doesn't reveal which field is wrong | ✓ |
| Field-specific error | Tells user if email is unknown vs password wrong — friendlier UX but leaks info | |
| Include reset flow | Forgot password page + email-based reset — completes the auth feature | ✓ |
| Defer reset | Admin is initially set up via CLI/seed; password reset can be added later | |
| Include remember me | Sets longer token expiry — standard UX pattern, Sanctum supports it natively | ✓ |
| Skip remember me | Token always expires in 24h — simpler, fewer states to test | |

**User's choice:** Full-page login, generic errors, include reset flow, include remember me
**Notes:** N/A

---

## Dashboard Stats

| Option | Description | Selected |
|--------|-------------|----------|
| Services, Plans, Team, Blog, Contacts, Subscribers, Pages | All stat widgets shown | ✓ |
| Build-time SSG | Fetched during next build — static, no live updates | ✓ |
| Client-side fetch | Fetched on page load via admin API — always current | |

**User's choice:** All 7 widgets, build-time SSG fetch
**Notes:** N/A

---

## API Response Conventions

| Option | Description | Selected |
|--------|-------------|----------|
| Laravel-style meta | paginate() — includes current_page, last_page, per_page, total, links | ✓ |
| Cursor-based | next_cursor — better for large datasets, no offset drift | |
| Skip pagination | Return all records; add later if datasets grow | |
| spatie/laravel-query-builder | Standardized ?sort, ?filter, ?include — future-proof | ✓ |
| Standard query params | `?sort=name&order=asc` | |
| Minimal defaults | Return default sort order; no filter params in v1 | |
| Laravel default errors | `{ "message", "errors": { "field": [...] } }` — standard | ✓ |
| Flat messages array | `{ "message", "errors": [...] }` — simpler but loses field detail | |

**User's choice:** Laravel pagination, spatie/laravel-query-builder, default error format
**Notes:** N/A

---

## Media Library Admin UI

| Option | Description | Selected |
|--------|-------------|----------|
| Grid with list toggle | Both views available via toggle — flexible | ✓ |
| Grid view | Thumbnails only — visual, standard for media libraries | |
| List view | Table with filename, type, date — compact | |
| Single file upload | Click to select one file at a time — simpler | ✓ |
| Multi-file upload | Select multiple files at once | |
| Drag-and-drop zone | Full drag-and-drop zone + click to browse | |
| Confirmation dialog | 'Are you sure?' modal before deleting — prevents accidents | ✓ |
| Undo toast | Delete immediately with brief 'Undo' toast notification | |
| No confirmation | Delete immediately — simplest | |

**User's choice:** Grid with list toggle, single file upload, confirmation dialog
**Notes:** N/A

---

## Claude's Discretion

No areas where Claude was asked to decide — all decisions user-directed.

## Deferred Ideas

None.
