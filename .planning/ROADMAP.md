# Roadmap

## Epic 1: Foundation (P0) — Phase 1

Auth, API scaffold, admin shell, shared schemas.

- FR-12: Admin Authentication (Sanctum)
- FR-13: Admin Dashboard
- FR-15: Public REST API scaffold
- FR-14: Media Library
- Shared Zod schemas in `packages/shared`

## Epic 2: Marketing Content Backend (P0) — Phase 2

Backend CRUD for all marketing content types.

- FR-1: Manage Services
- FR-2: Manage Pricing Plans (+ PlanFeatures)
- FR-4: Manage Team Members
- FR-5: Manage Pages / Site Sections

## Epic 3: Blog System (P0) — Phase 3

Blog post CRUD with rich text editing.

- FR-3: Manage Blog Posts (with Quill editor)

## Epic 4: Frontend Public Pages (P0) — Phase 4

Public site components and pages.

- FR-7: Theme Application (CSS custom properties)
- FR-8: Display Pricing Table
- Public pages: homepage, blog listing, single post, 404

## Epic 5: Contact & Lead Capture (P0) — Phase 5

Contact form and newsletter.

- FR-9: Contact Form Submission
- FR-10: Newsletter Subscription
- Admin theme settings (FR-6)

## Epic 6: Admin Panel (P0) — Phase 6

Admin UI polish and remaining admin features.

- Admin CRUD pages for all content types
- Admin sidebar
- Dashboard stats

## Deferred (v1.1)

- FR-11: Contact Message Management (Admin)
- Subscriber management (Admin)

## Milestones

| Milestone | Phases | Description |
|-----------|--------|-------------|
| v1.0-alpha | 1-2 | Auth + backend CRUD functional |
| v1.0-beta | 3-4 | Blog + public pages |
| v1.0-rc | 5 | Contact + theme complete |
| v1.0 | 6 | Admin panel polish, final QA |
