# Deferred Work

## Deferred from: code review of 1-3-admin-dashboard-stat-widgets (2026-07-19)

- No admin role middleware on stats endpoint — pre-existing architecture, all admin routes use same `auth:sanctum` guard
- Non-existent stat card links (`/admin/messages`, `/admin/subscribers`, `/admin/blog-posts`) — acknowledged as v1.1 placeholders in spec
- No error boundary on dashboard — pre-existing pattern across all admin pages
- Card border-radius: accepted shadcn/ui `rounded-xl` (12px) over UX-DR7 spec (10px) — 2px difference is imperceptible
- Frontend component tests for skeleton loading state and responsive grid behavior — no frontend test infrastructure exists

## Deferred from: code review of 1-4-media-library-setup (2026-07-19)

- No auth guard on `destroy()` — single-admin CMS, intentional standalone library per story
- No auth guard on `index()` — same as above
- No DB transaction on upload — Spatie handles internally
- No file content/MIME magic byte verification — Spatie handles on processing
