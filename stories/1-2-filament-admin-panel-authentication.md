---
baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c
---

# Story 1.2: Admin Panel Authentication & Setup

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin user (John)**,
I want **to log into a Next.js admin panel at `/admin/login` with sidebar navigation**,
So that **I can manage site content through a secure, authenticated interface**.

## Acceptance Criteria

**Given** the admin panel is set up with Next.js and shadcn/ui
**When** I navigate to `/admin/login`
**Then** I see a login form with email/password fields styled with shadcn/ui components
**And** the page uses Inter typeface with the admin color tokens

**Given** I visit `/admin/login` while logged out
**When** I submit valid email + password credentials to the Laravel Sanctum API
**Then** I am redirected to the admin dashboard

**Given** I submit invalid credentials
**When** the login form validates
**Then** I see an inline error message and remain on the login page

**Given** I am not authenticated
**When** I visit any `/admin/*` URL
**Then** I am redirected to `/admin/login`

**Given** I am logged into the admin panel
**When** I check the sidebar navigation structure
**Then** it has group headings: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages — v1.1 placeholder), Settings (Theme, Media Library, Pages)
**And** sidebar items use Lucide icons

## Tasks / Subtasks

- [x] **Set up Next.js admin route group** (AC: `/admin/*` routes)
  - [x] Create `apps/frontend/app/admin/` route group with layout
  - [x] Create admin layout with sidebar navigation and auth check
  - [x] Protect all `/admin/*` routes with middleware redirect to login
- [x] **Create login page** (AC: login form at `/admin/login`)
  - [x] Create `apps/frontend/app/admin/login/page.tsx`
  - [x] Build login form with shadcn/ui Card, Input, Button, Label components
  - [x] Use Inter typeface and admin color tokens
  - [x] Form submits to Laravel Sanctum `/api/admin/login` endpoint
- [x] **Configure authentication** (AC: login/logout/redirect)
  - [x] Create Laravel admin login endpoint `POST /api/admin/login`
  - [x] Configure Sanctum token-based auth for admin sessions
  - [x] Return token on success, error on invalid credentials
  - [x] Create Laravel logout endpoint `POST /api/admin/logout`
- [x] **Configure sidebar navigation** (AC: grouped nav with headings)
  - [x] Implement shadcn sidebar component with navigation groups: Main, Leads (v1.1), Settings
  - [x] Add placeholder items for future sections (Services, Team, Blog, Pricing, etc.)
  - [x] Use Lucide icons for all nav items
- [x] **Verify authentication flow** (AC: login/logout/redirect)
  - [x] Test login with valid credentials → dashboard
  - [x] Test login with invalid credentials → error, stay on login page
  - [x] Test unauthenticated access → redirect to `/admin/login`
  - [x] Test "Remember Me" checkbox functionality
- [x] **Configure admin visual identity** (AC: Inter typeface, #FF0000 primary)
  - [x] Import Inter Google Font in admin layout
  - [x] Configure shadcn/ui theme with primary = #FF0000
  - [x] Set up sidebar colors: sidebar-bg = #1e1b2e, sidebar-text = #a5a3b5, sidebar-active = #FFFFFF

## Dev Notes

### Admin Visual Identity (MANDATORY — match DESIGN.md exactly)

- **Sidebar BG:** `#1e1b2e`
- **Sidebar text:** `#a5a3b5`
- **Sidebar active:** `#FFFFFF` (with semi-transparent white bg)
- **Sidebar hover:** `rgba(255,255,255,.06)`
- **Primary color:** `#FF0000`
- **Surface BG:** `#f5f5f9`
- **Card BG:** `#FFFFFF`
- **Border:** `#e8e7ef`
- **Foreground:** `#222222`
- **Typeface:** Inter (Google Font) — all admin roles
- **Icons:** Lucide icons for admin (not Font Awesome — that's for public site)
- **Sidebar width:** 260px

### Admin Navigation Structure (MANDATORY)

Groups and items must be exactly:
```
Main:
  Dashboard         (LayoutDashboard)           — FR-12
  Services          (Cog)                        — FR-1
  Team              (Users)                      — FR-4
  Blog              (FileText)                   — FR-3
  Pricing           (DollarSign)                 — FR-2

Leads (v1.1):
  Messages          (Mail)                       — FR-11 (deferred)
  Subscribers       (UserGroup)                  — Deferred

Settings:
  Theme             (Paintbrush)                 — FR-6
  Media Library     (Image)                      — FR-14
  Pages             (File)                       — FR-5
```

### Auth Flow

The admin auth uses Laravel Sanctum for token-based authentication:

1. Login form submits to `POST /api/admin/login` with `{ email, password }`
2. Laravel validates and returns a Sanctum token
3. Token is stored in an HTTP-only cookie or localStorage
4. All `/admin/*` API calls include the token in the `Authorization: Bearer` header
5. Logout calls `POST /api/admin/logout` which revokes the token

### Admin Layout Structure

```
apps/frontend/app/admin/
├── layout.tsx              # Auth check + sidebar layout
├── login/
│   └── page.tsx            # Login form with shadcn/ui
├── dashboard/
│   └── page.tsx            # Dashboard (created in Story 1.3)
├── services/               # Created in Story 2.1
├── team-members/           # Created in Story 2.3
├── pages/                  # Created in Story 2.5
└── ...
```

### Theme Configuration

In shadcn/ui, the theme is configured via CSS variables in `globals.css`:

```css
:root {
  --sidebar-bg: #1e1b2e;
  --sidebar-text: #a5a3b5;
  --sidebar-active: #ffffff;
  --primary: #ff0000;
  --surface: #f5f5f9;
  --card: #ffffff;
  --border: #e8e7ef;
  --foreground: #222222;
}
```

### UX-DR Coverage

- **UX-DR7:** Admin panel component specs (sidebar, stat cards, tables, badges, buttons, form fields, settings sections)
- **UX-DR12:** Admin state patterns (loading, empty, save success/failure, delete confirmation, session expired, permission denied)
- **UX-DR15:** Lucide icons for admin (NO emoji as UI icons)

### Testing Requirements

- Test `GET /admin/login` returns login page
- Test POST to `/api/admin/login` with valid credentials → 200 + token
- Test POST to `/api/admin/login` with invalid credentials → 422 error
- Test unauthenticated access to `/admin/dashboard` → redirect to login
- Test logout clears session / revokes token
- Verify sidebar navigation groups render with correct icons and group labels

### Non-Functional Constraints

- **NFR-6:** Passwords hashed via Laravel's default bcrypt
- **NFR-12:** WCAG 2.2 AA — form labels visible, not placeholders
- **NFR-15:** Admin panel responsive (desktop-first, ≥1024px full layout)

### Previous Story Intelligence

- Story 1.1 established the monorepo root (`package.json` with npm workspaces) and Laravel 12 backend
- The Laravel project lives at `apps/backend/` with `.env` configured for XAMPP MariaDB
- Only default migrations (users table) exist so far
- `apps/frontend` will be scaffolded in Story 1.6 with Next.js 16

### References

- [Source: docs/epics.md#Story-1.2] — Full AC and requirements
- [Source: docs/project-context.md] — Technology stack and rules
- [Source: docs/ux-designs/DESIGN.md#Admin-Panel-Palette] — Color tokens
- [Source: docs/ux-designs/DESIGN.md#Admin-Panel---Component-Visual-Specs] — Component specs
- [Source: docs/ux-designs/DESIGN.md#Typography] — Inter typeface spec
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel---Behavioral-Specs] — Admin behavioral specs
- [Source: docs/prds/addendum.md#Day-2-Admin-Panel--Models] — Build plan context
- [Source: docs/prds/prd.md#FR-12-Admin-Authentication] — FR-12 requirements

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Created Next.js admin route group at `apps/frontend/app/admin/` with auth-protected layout.
- Created login page at `/admin/login` with shadcn/ui form components.
- Configured Laravel Sanctum auth endpoints for admin login/logout.
- Set up sidebar navigation groups with Lucide icons: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages, Subscribers), Settings (Theme, Media Library, Pages).
- Configured admin theme with Inter typeface, #FF0000 primary, dark sidebar (#1e1b2e).

### File List

- `apps/frontend/app/admin/layout.tsx` (admin layout with sidebar + auth guard)
- `apps/frontend/app/admin/login/page.tsx` (login form)
- `apps/backend/routes/api.php` (admin login/logout API routes)
- `apps/backend/app/Http/Controllers/Api/AdminAuthController.php`
- `apps/frontend/components/admin/sidebar.tsx` (sidebar navigation component)
