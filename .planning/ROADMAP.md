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

### Phase 01.1: Loading and progress UI (INSERTED)

**Goal:** Add loading states, page transition indicators, and validation progress feedback across the admin panel
**Requirements**: NFR-1, FR-1, FR-2, FR-3, FR-4, FR-5, FR-13, FR-14
**Depends on:** Phase 1
**Plans:** 4 plans (01.1-01, 01.1-02, 01.1-03, 01.1-04)

Plans:

- [x] 01.1-01: Core Loading Components (Skeleton, Spinner, Progress)
- [x] 01.1-02: Toast Notification System
- [x] 01.1-03: Page Transition Overlay (RouteChangeLoader)
- [x] 01.1-04: Form Feedback & Page Integration

### Phase 2: Marketing Content Backend (P0)

**Goal**: Backend CRUD for services, pricing plans, team members, pages
**Depends on**: Phase 1
**Requirements**: FR-1, FR-2, FR-4, FR-5
**Success Criteria** (what must be TRUE):

  1. Admin can create/read/update/delete services with icon, title, description
  2. Admin can manage pricing plans with features, popular toggle, CTA
  3. Admin can manage team members with photo, bio, sort order
  4. Admin can manage pages/site sections with hero, JSON sections

**Plans**: 3 plans (02-01, 02-02, 02-03)

Plans:

- [x] 02-01: Tracer — Team Member Photo Upload + Route Fixes
- [x] 02-02: Expansion — Sort Order Controls + Toast Integration + Form Validation Polish
- [x] 02-03: Expansion — Social Links Form Fields + Polish Audit

### Phase 3: Blog System (P0)

**Goal**: Blog post CRUD with rich text editing + public blog pages
**Depends on**: Phase 1, 2
**Requirements**: FR-3
**Success Criteria** (what must be TRUE):

  1. Admin can create/edit/publish blog posts with Quill editor
  2. Blog posts have auto-generated slugs and featured images
  3. Public blog endpoint filters published-only, sorted by published_at desc
  4. Admin endpoint returns all posts (drafts + published)
  5. Content is sanitized via HTMLPurifier on save
  6. Admin has sort controls, reading time, auto-save indicator
  7. Public /blog listing page with responsive grid + pagination
  8. Public /blog/[slug] single post page with SEO metadata
  9. Homepage shows "Latest Insights" section with 3 blog cards
  10. Blog link in header navigation

**Plans**: 3/4 plans executed

Plans:

- [x] 03-04-PLAN.md

- [x] 03-02-PLAN.md
- [x] 03-03-PLAN.md
- [ ] 03-PLAN.md

- [x] 03-01: Tracer — Blog Admin API + Content Sanitization + Admin UX Polish
- [x] 03-02: Expansion — Public Blog Pages (Listing + Single Post + 404)
- [x] 03-03: Expansion — Homepage Latest Posts + Blog Nav Link + Final Polish

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
| 1. Foundation | v1.0-alpha | 1/1 | Complete    | 2026-07-26 |
| 1.1. Loading & Progress UI | v1.0-alpha | 4/4 | ✓ Complete | 2026-07-26 |
| 2. Marketing Content Backend | v1.0-alpha | 3/3 | Complete    | 2026-07-26 |
| 3. Blog System | v1.0-beta | 4/4 | Complete    | 2026-07-26 |
| 4. Frontend Public Pages | v1.0-beta | — | Not started | - |
| 5. Contact & Lead Capture | v1.0-rc | — | Not started | - |
| 6. Admin Panel | v1.0 | — | Not started | - |
| 7. Lead Management | v1.1 | — | Not started | - |
