# Roadmap: Adsvance Media Tech CMS

## Overview

A clean, reusable CMS on Laravel + Next.js. Six phases build from foundation (auth, API scaffold, admin shell) through marketing content backend, blog system, public frontend pages, contact/lead capture, and admin panel polish.

## Milestones

- 🚧 **v1.0-alpha** — Phases 1-2 (Auth + backend CRUD functional)
- 📋 **v1.0-beta** — Phases 3-4 (Blog + public pages)
- 📋 **v1.0-rc** — Phase 5 (Contact + theme complete)
- 📋 **v1.0** — Phase 6 (Admin panel polish, final QA)

## Phases

### Phase 1: Foundation (P0)
**Goal**: Auth, API scaffold, admin shell, shared Zod schemas
**Depends on**: Nothing
**Requirements**: FR-12, FR-13, FR-15, FR-14
**Success Criteria** (what must be TRUE):
  1. Admin can log in with email/password via Sanctum
  2. Admin dashboard shows stat widgets for existing content types
  3. Public GET endpoints respond with `{ "data": ... }` envelope
  4. Media library upload/browse/delete works for JPG/PNG/WebP/SVG
  5. Shared Zod schemas in `packages/shared` mirror API response shapes
**Plans**: 4 plans (01-01, 01-02, 01-03, 01-04)

Plans:
- [x] 01-01: Auth — remember me, password reset flow, auth tests
- [x] 01-02: API Standardization — spatie/laravel-query-builder, pagination, error format
- [x] 01-03: Shared Zod Schemas — auth, stats, media schemas
- [x] 01-04: Feature Tests — media tests, auth tests

### Phase 2: Marketing Content Backend (P0)
**Goal**: Backend CRUD for services, pricing plans, team members, pages
**Depends on**: Phase 1
**Requirements**: FR-1, FR-2, FR-4, FR-5
**Success Criteria** (what must be TRUE):
  1. Admin can create/read/update/delete services with icon, title, description
  2. Admin can manage pricing plans with features, popular toggle, CTA
  3. Admin can manage team members with photo, bio, sort order
  4. Admin can manage pages/site sections with hero, JSON sections
**Plans**: TBD

### Phase 3: Blog System (P0)
**Goal**: Blog post CRUD with rich text editing
**Depends on**: Phase 1
**Requirements**: FR-3
**Success Criteria** (what must be TRUE):
  1. Admin can create/edit/publish blog posts with Quill editor
  2. Blog posts have auto-generated slugs and featured images
  3. Blog posts are available via public API
**Plans**: TBD

### Phase 4: Frontend Public Pages (P0)
**Goal**: Public site components and pages consuming the API
**Depends on**: Phase 2, 3
**Requirements**: FR-7, FR-8
**Success Criteria** (what must be TRUE):
  1. Theme CSS custom properties are applied from API settings
  2. Pricing table renders responsively with features, CTA, popular ribbon
  3. Public homepage, blog listing, single post, and 404 pages render
**Plans**: TBD

### Phase 5: Contact & Lead Capture (P0)
**Goal**: Contact form and newsletter subscription
**Depends on**: Phase 1
**Requirements**: FR-9, FR-10, FR-6
**Success Criteria** (what must be TRUE):
  1. Contact form submissions store in DB and send email notification
  2. Newsletter signups store email with single-step subscribe
  3. Admin theme settings (colors, fonts, logos) are manageable
**Plans**: TBD

### Phase 6: Admin Panel (P0)
**Goal**: Admin UI polish and remaining admin features
**Depends on**: Phase 2, 3
**Requirements**: FR-1, FR-2, FR-3, FR-4, FR-5
**Success Criteria** (what must be TRUE):
  1. Admin sidebar navigation lists all content types
  2. Admin CRUD pages exist for all content types with consistent UX
  3. Dashboard stats widgets show counts for all content types
**Plans**: TBD

### 📋 v1.1 (Deferred)

**Milestone Goal:** Contact message management and subscriber admin

#### Phase 7: Lead Management (v1.1)
**Goal**: Admin views and manages contact messages and subscribers
**Depends on**: Phase 5
**Requirements**: FR-11
**Success Criteria** (what must be TRUE):
  1. Admin can view, mark as read, and delete contact submissions
  2. Admin can view and manage newsletter subscribers
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0-alpha | 4/4 | Executed | - |
| 2. Marketing Content Backend | v1.0-alpha | — | Not started | - |
| 3. Blog System | v1.0-beta | — | Not started | - |
| 4. Frontend Public Pages | v1.0-beta | — | Not started | - |
| 5. Contact & Lead Capture | v1.0-rc | — | Not started | - |
| 6. Admin Panel | v1.0 | — | Not started | - |
| 7. Lead Management | v1.1 | — | Not started | - |
