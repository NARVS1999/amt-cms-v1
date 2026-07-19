---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-01-user-confirmed
  - step-02-design-epics
  - step-02-epics-approved
userConfirmed: true
inputDocuments:
  - docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
  - docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md
  - docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
  - docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md
  - docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md
---

# Adsvance Media Tech CMS - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **Adsvance Media Tech CMS**, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories. The CMS converts a legacy static HTML marketing site into a reusable, themeable CMS foundation — powering Adsvance's own marketing site and serving as a drop-in base for client projects.

**Stack:** Laravel 12 (REST API), Next.js 16.2.10 SSG (frontend with shadcn/ui), MySQL/MariaDB, Tailwind CSS v4.
**Paradigm:** Monorepo with npm workspaces (`apps/backend`, `apps/frontend`, `packages/shared`).
**Hosting:** Hostinger Business Shared — Laravel in `~/laravel_app/`, Next.js static export in `public_html/`.

## Requirements Inventory

### Functional Requirements

**FR-1: Manage Services**
Admin can create, read, update, delete, and reorder services (icon as Font Awesome class name, title, description). Services appear on homepage in admin-set order.

**FR-2: Manage Pricing Plans**
Admin can create, read, update, delete, and reorder pricing plans. Each plan has name, monthly price (PHP numeric), "Most Popular" toggle, CTA text, and a list of features (description + included/not-included flag). Plans appear in admin-set order. "Most Popular" shows a ribbon badge. Price validates for numeric input.

**FR-3: Manage Blog Posts**
Admin can create, read, update, delete blog posts with title, auto-generated slug (overridable), rich text content (via Quill), excerpt, featured image, and published-at date. A "Published" toggle controls visibility. Published posts appear on `/blog` sorted by date descending. Unpublished posts do not appear on the public site.

**FR-4: Manage Team Members**
Admin can create, read, update, delete, and reorder team members with name, role, photo upload, and bio. Team section on public site reflects admin-set order. Photo upload accepts JPG, PNG, WebP up to 2MB.

**FR-5: Manage Pages / Site Sections**
Admin can update key homepage sections (hero heading, hero subtext, hero image, about content, video embed URL). Managed as Page records with slug identifier, hero fields, and a JSON `sections` field for structured content blocks. Validation on JSON schema structure.

**FR-6: Manage Theme Settings**
Admin can set primary color, secondary color, accent color, body font, heading font, light logo image, dark logo image, and favicon through a dedicated Theme Settings page. Color inputs validate hex format. Font inputs validate as known Google Font names. Empty settings fall back to legacy red scheme.

**FR-7: Theme Application (Frontend)**
Next.js frontend fetches `/api/theme` at build time and generates CSS custom properties (`--color-primary`, `--color-secondary`, `--color-accent`, `--font-body`, `--font-heading`) on `:root`. Tailwind extends its config from these variables. All components resolve through CSS vars — no hardcoded brand colors.

**FR-8: Display Pricing Table**
Public frontend renders a responsive pricing table (Basic, Premium, Ultimate) with plan name, price (₱), feature list with check/cross icons, CTA button, and "Most Popular" ribbon on the designated plan. CTA button scrolls to contact section. Features marked `included: true` show a green check; `false` shows a red X.

**FR-9: Contact Form Submission**
Public visitors can submit name, email, and message through the contact form. System saves submission to database and dispatches notification email to `CONTACT_NOTIFICATION_EMAIL`. Missing required fields return inline validation errors. Rate-limited: max 5 submissions per IP per minute. Message stored with `read_at: null`.

**FR-10: Newsletter Subscription**
Public visitors can subscribe with their email address. Single-step subscription (no double opt-in for v1). Duplicate email returns "already subscribed" message. Invalid email format rejected with validation. Rate-limited: max 3 subscriptions per IP per minute.

**FR-11: Contact Message Management (Admin) — v1.1**
Admin can view all contact submissions, mark messages as read, and delete messages. Unread messages visually distinct (bold/highlighted). *Deferred to v1.1.*

**FR-12: Admin Authentication**
Admin users log in with email and password via Next.js login page against REST API. Supports "Remember Me." Unauthenticated users redirected to `/admin/login`. Session expires after configurable inactivity.

**FR-13: Admin Dashboard**
Next.js admin dashboard displays quick-stat widgets with shadcn/ui components: total services, published blog posts, unread contact messages, newsletter subscriber count. Widget counts update after relevant CRUD operations. Clicking a widget navigates to the corresponding admin list page.

**FR-14: Media Library**
Admin can upload, browse, and delete media files. Accepted formats: JPG, PNG, WebP, SVG. Max file size: 2MB. Deleting a media file removes it from storage. Media can be attached to any model (blog post, team member, page, theme).

**FR-15: Public REST API**
Laravel backend exposes GET endpoints (`/api/pages`, `/api/services`, `/api/team`, `/api/blog-posts`, `/api/pricing-plans`, `/api/theme`) and POST endpoints (`/api/contact`, `/api/subscribe`). All GET return HTTP 200 with `{ "data": ... }`. POST return HTTP 201 on success, 422 on validation failure. Unknown routes return 404. Consistent JSON:API-style structure. CORS restricted to deployed frontend domain.

### Non-Functional Requirements

**NFR-1: Frontend Performance (SSG)**
Next.js SSG pages must load in under 2 seconds on Hostinger shared hosting (Lighthouse Mobile). Maximum bundle size under 300KB JS + CSS total. All pages pre-built as static HTML — no server-side rendering.

**NFR-2: API Performance**
API GET endpoints must respond in under 200ms (with Laravel response caching where appropriate).

**NFR-3: Security — HTTPS & CORS**
Admin panel accessible only over HTTPS in production. CORS restricted to the deployed frontend domain. All API inputs validated via Laravel FormRequest classes.

**NFR-4: Content Sanitization**
Rich text content (blog post body) sanitized before public render via HTMLPurifier or equivalent. Strip disallowed tags, allow safe HTML (headings, lists, links, images, bold, italic).

**NFR-5: Rate Limiting**
Contact form: max 5 submissions per IP per minute. Newsletter: max 3 per IP per minute. Implemented via Laravel's RateLimiter, database-backed.

**NFR-6: Authentication Security**
Admin passwords hashed via Laravel's default bcrypt. SQL injection impossible via Eloquent ORM (no raw queries in v1).

**NFR-7: Reliability — Email Queue**
Contact form submissions stored in DB before email dispatch. Email runs through Laravel queue (database driver, no Redis). Failed deliveries retry up to 3 times. Message record survives regardless of email delivery.

**NFR-8: Graceful Degradation**
If the API is unreachable during Next.js build, the build fails with a clear error message rather than producing a broken site.

**NFR-9: Environment-Driven Configuration**
All configuration is environment-driven (`.env`), never hardcoded. Key variables: `CONTACT_NOTIFICATION_EMAIL`, `APP_NAME`, `APP_URL`, `DB_*`, `MAIL_*`.

**NFR-10: Zero-Cost Software Stack**
All software must be free/open-source: Laravel, Next.js, shadcn/ui, Quill, Font Awesome. Hostinger shared hosting cost only (~$3-10/month). No paid APIs.

**NFR-11: Hostinger Compatibility**
Laravel runs on Hostinger Business Shared (PHP 8.2). Next.js frontend deploys as static HTML/JS/CSS — no Node runtime on server. MySQL database included in Hostinger plan.

**NFR-12: WCAG 2.2 AA Accessibility**
Both surfaces meet WCAG 2.2 AA. Skip-to-content link. Landmark regions. Form labels visible (not placeholders). Error announcements via `aria-describedby`. Status announcements via `aria-live="polite"`. Mobile nav: `aria-expanded`, `role="dialog"`, focus trapping. Keyboard operable — all interactive elements reachable and operable via keyboard. Focus order matches visual reading order.

**NFR-13: Browser Support**
Latest 2 versions of Chrome, Firefox, Safari, Edge. No PWA, no offline mode in v1.

**NFR-14: Mobile-Responsive Public Site**
Mobile-first responsive: full desktop at ≥992px, tablet at 768-991px, mobile at ≤767px. Single-column on mobile, hamburger menu replaces full nav. Section padding reduces to 40px on mobile.

**NFR-15: Admin Panel Responsiveness**
Admin desktop-first: full layout at ≥1024px, sidebar collapses to icon-only at 768-1023px, off-canvas sidebar at ≤767px. Content authoring designed for larger screens; mobile supports read-light operations.

**NFR-16: Content Security — No Raw Queries**
SQL injection impossible via Eloquent ORM. No raw SQL queries in v1 codebase.

### Additional Requirements (Architecture)

- **AD-1 — Flat Laravel structure:** Standard `app/Models/`, `app/Http/Controllers/Api/`, `app/Http/Requests/`. No domain folders. Standard Laravel MVC conventions throughout.
- **AD-2 — Frontend is static consumer:** Next.js in SSG mode (`output: 'export'`). All data fetched at build time via REST API. No database connections, no `getServerSideProps`. Deployed as flat `out/` folder.
- **AD-3 — REST API is the contract:** Consistent JSON envelope: `{ "data": ... }` for success, `{ "message": "...", "errors": {...} }` for validation failures. `packages/shared` has Zod schemas mirroring API shapes.
- **AD-4 — Theme system via CSS custom properties:** Theme settings stored as key-value pairs. Next.js writes values into `:root` CSS custom properties at build time. Tailwind extends colors/fontFamily from `var(--*)`. No hardcoded brand colors in components.
- **AD-5 — Admin is sole content authority:** All content CRUD through REST API with auth middleware. Public API is read-only (GET) except contact/subscribe POST endpoints. Admin auth required for writes.
- **AD-6 — Media storage:** All file uploads stored in `storage/app/public/`, symlinked to `public/storage/`. Each model handles its own file attachments. Deleting a model cascades to its associated files.
- **AD-7 — Unidirectional content flow:** Admin writes → MySQL → REST API → Next.js build → Static HTML. Content is "ready" after save, "live" after deploy. Admin does not trigger builds.
- **AD-8 — Queued email with DB fallback:** Contact submissions saved to DB before email dispatch. Database queue driver (no Redis). Retry up to 3 times on failure.
- **Starter template:** Greenfield monorepo — `laravel new apps/backend`, `create-next-app apps/frontend`, custom `packages/shared`.
- **Database migrations created just-in-time:** Each migration is created in the story that first needs the table. Migrations include: `marketing_pages`, `marketing_services`, `marketing_team_members`, `marketing_blog_posts`, `billing_pricing_plans`, `billing_plan_features`, `contact_contact_messages`, `contact_subscribers`, `theming_theme_settings`, plus the default Laravel `users` table (created in Story 1.1).
- **Quill.js integration:** Rich text editor for blog posts. Toolbar: bold, italic, headings (h2/h3), ordered/unordered lists, link, image. Auto-save draft every 30 seconds.
- **SSG build & deploy:** `npm run build` produces `apps/frontend/out/`. Upload contents to Hostinger `public_html/`. `.htaccess` rewrite for client-side routing.
- **CORS configuration:** Restricted to deployed frontend domain in production. Allow `*` in local dev.
- **Deployment topology:** Laravel at `~/laravel_app/` (outside `public_html`). Next.js static files at `public_html/`. API requests from frontend go to Laravel via URL rewrite or subdomain.

### UX Design Requirements

**UX-DR1: Implement Two-Skin Design System**
Implement dual visual identity: public site (warm, Poppins, red #FF0000 primary, amber accent #FFC107, card-based layouts) and admin panel (cold, Inter, dark sidebar #1e1b2e, red primary as only connective token). All visual tokens specified in DESIGN.md frontmatter (60+ tokens across colors, typography, rounded corners, spacing, elevation, components).

**UX-DR2: Implement Public Site Color Palette**
Implement full public site palette: primary (#FF0000), secondary (#fb3d03), accent (#FFC107), background (#FFFFFF), foreground (#333333), muted (#f5f5f5), muted-foreground (#888888), border (#f0f0f0), success (#22c55e), error (#ef4444), hero gradient (#fff8f0 → #fff5f5), footer-bg (#1A1A1A), footer-text (#999999). All as CSS custom properties.

**UX-DR3: Implement Admin Panel Color Palette**
Implement admin palette: sidebar-bg (#1e1b2e), sidebar-text (#a5a3b5), sidebar-active (#FFFFFF), sidebar-hover (rgba(255,255,255,.06)), surface-bg (#f5f5f9), card-bg (#FFFFFF), border (#e8e7ef), primary (#FF0000), foreground (#222222), muted-foreground (#888888).

**UX-DR4: Implement Public Site Typography**
Poppins across all public roles: Display (48px/800/1.2), Heading (36px/700/1.3), Subheading (20px/600/1.4), Body (16px/400/1.7), Small (13px/400/1.5), Label (13px/600/uppercase/2px tracking). Import from Google Fonts.

**UX-DR5: Implement Admin Panel Typography**
Inter across all admin roles: Display (24px/700/1.3), Heading (18px/600/1.4), Body (14px/400/1.5), Small (12px/400/1.4), Label (11px/600/uppercase/0.5px tracking). Import from Google Fonts.

**UX-DR6: Implement Public Site Component Specs**
Build all public components per DESIGN.md visual specs:
- Primary Button: red fill, white text, pill radius 50px. Hover: darken #d40000, translateY(-2px), shadow.
- Outline Button: transparent, red border+text. Hover: fill red, text white.
- Service Card: white card, 10px radius, 1px border, 64px gradient icon circle. Hover: translateY(-6px), shadow.
- Pricing Card: white stacked card with features. "Most Popular": red border + ribbon badge.
- Blog Card: white card, 200px image, 10px radius. Hover: shadow lift, translateY(-4px).
- Footer: dark #1A1A1A, logo + 3-column links + newsletter input.
- Mobile Hamburger: 3 lines → X on open (CSS transition).
- Back-to-Top: fixed, primary bg, chevron-up icon. Appears after 300px scroll.

**UX-DR7: Implement Admin Panel Component Specs**
Build all admin panel component visuals per DESIGN.md:
- Sidebar: 260px dark panel. Active: white bg + text. Hover: subtle lighter bg. Group labels: uppercase/tracking/30% opacity.
- Stat Card: white, 10px radius, 1px border, 44px colored icon square.
- Table: clean header (11px uppercase gray), bottom border rows, hover: #fafafa.
- Badge: pill counter, red fill, white text, 11px.
- Primary/Secondary Buttons: as specified.
- Form Field: 1.5px border, 6px radius. Focus: primary border + 3px ring.
- Settings Section: white card with collapsible header.

**UX-DR8: Implement Public Site Navigation Behavior**
Navbar links smooth-scroll to sections (`#services`, `#pricing`, etc.). Active section highlighted via Intersection Observer. Mobile hamburger toggles slide-out drawer with semi-transparent overlay (tap-to-close), body scroll locked, `aria-expanded` toggles, `role="dialog"`, `aria-modal="true"`, focus trapped. Pricing CTA scrolls to contact section. Blog cards navigate to `/blog/{slug}`. Back-to-top hidden until 300px scroll, smooth-scroll click.

**UX-DR9: Implement Admin Panel Navigation Behavior**
Admin sidebar navigation groups: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages — v1.1 placeholder), Settings (Theme, Media Library, Pages). Stat cards clickable — navigate to resource list. Table rows clickable — navigate to edit view. Quick action buttons create new records. Theme color swatch + hex input sync bidirectionally. Logo upload zones with click and drag-and-drop. Auto-save Quill draft every 30s. Published/unpublished toggle explicit.

**UX-DR10: Implement Contact Form State Patterns**
Four states: idle (all fields empty), success (inline green "Thanks! We'll get back to you soon." fades after 5s, form resets), error (inline red message, fields retain values), rate limited ("Too many submissions. Try again in a minute."). All states use `aria-live="polite"` region.

**UX-DR11: Implement Newsletter Subscribe State Patterns**
Three states: success (inline "Subscribed!" clears input), duplicate ("Already subscribed."), invalid email (inline validation error, input retains value).

**UX-DR12: Implement Admin Panel State Patterns**
Implement all admin state treatments:
- Loading data: skeleton rows (5-6 matching column structure).
- Empty resource: illustration + description + primary action button.
- Cold app load: skeletons for stat cards + table rows.
- Save success: green notification, auto-dismiss 3s.
- Save failure: red notification, persistent until dismissed.
- Delete confirmation: modal with "Are you sure?" + destructive Delete button + Cancel.
- Theme unsaved changes: save always active, preview reflects current pickers.
- Media oversized upload: inline error "File too large. Max 2MB."
- Media wrong format: "Format not supported. Accepted: JPG, PNG, WebP, SVG."
- Session expired: redirect to login with message.
- Permission denied: access denied page.

**UX-DR13: Implement Accessibility Floor**
WCAG 2.2 AA across both surfaces. Skip-to-content link (first focusable, visible on focus). Landmark regions (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>` with `aria-label`). All inputs have visible `<label>` elements — no placeholders as labels. Form validation errors use `aria-describedby` on input pointing to error message. Contact form success/failure uses `aria-live="polite"`. Mobile nav hamburger has `aria-expanded` (true/false). Pricing table "Most Popular" announced via `aria-label`. Color pickers have hex input as accessible alternative. Quill toolbar buttons labeled with `aria-label`. Keyboard operable — all interactive elements reachable via keyboard. Focus order matches visual reading.

**UX-DR14: Implement Responsive Breakpoints**
Public site: ≥992px (desktop, 2-column hero, 4-column services, 3-column pricing), 768-991px (tablet, single-column hero, 2-column services), ≤767px (mobile, single column everything, hamburger nav, 40px padding). Admin: ≥1024px (full sidebar visible), 768-1023px (icon-only sidebar with hover labels), ≤767px (off-canvas sidebar, single-column content, horizontal scroll tables).

**UX-DR15: Implement No-Emoji / Icon Rules**
Font Awesome Free for all public site icons. Lucide icons for all admin icons (shadcn/ui default). No emoji used as UI icons anywhere in production. No celebration animations, no confetti, no exclamation marks in admin microcopy. Admin is a tool, not a cheerleader.

**UX-DR16: Implement Public Site Microcopy**
Voice is warm, confident, straightforward. Uses "you" and "we." No jargon. Examples: "Need a business website?" not "Leverage our comprehensive web solutions." "Starting at ₱498/month" not "Competitively priced entry-tier offering." Admin microcopy is neutral and direct: "Saved." / "Couldn't save. Try again." / "Delete this post? This can't be undone." / "No posts yet. Create your first one."

**UX-DR17: Implement 404 Page**
Catch-all for unknown routes. "Page not found" with illustration and "Go Home" button.

### FR Coverage Map

| FR | Located In | AD Governance | UX Coverage |
|----|-----------|---------------|-------------|
| FR-1: Manage Services | Epic 2 (Core Site Content) | AD-1, AD-5 | UX-DR6 (Service Card) |
| FR-2: Manage Pricing Plans | Epic 3 (Pricing & Plans) | AD-1, AD-5 | UX-DR6 (Pricing Card) |
| FR-3: Manage Blog Posts | Epic 4 (Blog Engine) | AD-1, AD-5 | UX-DR9 (Quill auto-save), UX-DR6 (Blog Card) |
| FR-4: Manage Team Members | Epic 2 (Core Site Content) | AD-1, AD-5 | UX-DR6 (Team grid) |
| FR-5: Manage Pages | Epic 2 (Core Site Content) | AD-1, AD-5 | — |
| FR-6: Manage Theme Settings | Epic 5 (Theme System) | AD-4, AD-5 | UX-DR7 (Settings section), UX-DR9 (Color picker) |
| FR-7: Theme Application (Frontend) | Epic 5 (Theme System) | AD-4, AD-2 | UX-DR2, UX-DR3, UX-DR4, UX-DR5 (Tokens) |
| FR-8: Display Pricing Table | Epic 3 (Pricing & Plans) | AD-2, AD-3 | UX-DR6 (Pricing Card), UX-DR14 (Responsive) |
| FR-9: Contact Form Submission | Epic 6 (Contact & Leads) | AD-3, AD-8 | UX-DR10 (States), UX-DR13 (A11Y) |
| FR-10: Newsletter Subscription | Epic 6 (Contact & Leads) | AD-3 | UX-DR11 (States), UX-DR13 (A11Y) |
| FR-11: Contact Message Management | *Deferred v1.1* | — | — |
| FR-12: Admin Authentication | Epic 1 (Foundation) | AD-5 | UX-DR7 (Admin login) |
| FR-13: Admin Dashboard | Epic 1 (Foundation) | AD-5 | UX-DR7 (Stat Card), UX-DR12 (Admin states) |
| FR-14: Media Library | Epic 1 (Foundation) | AD-6 | UX-DR12 (Media states) |
| FR-15: Public REST API | Epic 1 (Foundation) | AD-3 | — |

## Epic List

### Epic 1: Foundation & Admin Shell
Scaffold the monorepo, Laravel 12 backend, shadcn admin panel in Next.js with authentication and dashboard, Next.js 16 frontend with SSG, database migrations, media library, and public REST API endpoint structure. After this epic, John can log into a working admin panel and the API contract is established.
**FRs covered:** FR-12 (Auth), FR-13 (Dashboard), FR-14 (Media Library), FR-15 (API)

#### Story 1.1: Scaffold Monorepo & Backend Foundation

As a **developer**,
I want **the monorepo scaffolded with Laravel 12 backend connected to XAMPP MariaDB**,
So that **the development environment is ready for feature work**.

**Note:** Only the `users` table migration is created here. Domain-specific migrations (marketing_services, billing_pricing_plans, etc.) are created in the stories that first need them.

**Acceptance Criteria:**

**Given** a clean project at `C:\Users\Admin\Desktop\project\AMT_V2`
**When** I run the scaffold commands
**Then** the root `package.json` defines npm workspaces: `["apps/backend", "apps/frontend", "packages/shared"]`
**And** `apps/backend` contains a fresh Laravel 12 installation with `.env` configured for XAMPP MariaDB (DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
**And** `php artisan serve` starts without errors
**And** `php artisan migrate` runs the default Laravel migrations successfully (users table, password_resets, etc.) — domain-specific migrations will be added in their respective stories
**And** a `.gitignore` at root covers `vendor/`, `node_modules/`, `.env`, `storage/`, `out/`
**And** `public/storage` is symlinked to `storage/app/public`

**Given** local PHP 8.2.12, Composer 2.8.9, Node 20.17.0 are installed
**When** I run `composer install` in `apps/backend`
**Then** it completes without errors

#### Story 1.2: Next.js Admin Login Page (shadcn/ui)

As an **admin user (John)**,
I want **to log into a shadcn admin login page at `/admin/login`**,
So that **I can manage site content through a secure, authenticated interface**.

**Acceptance Criteria:**

**Given** I visit `/admin/login` while logged out
**When** the page loads
**Then** I see a centered login card with email input, password input, "Remember Me" checkbox, and "Sign In" button
**And** all form elements use shadcn/ui components (Card, Input, Button, Checkbox, Label)

**Given** I submit valid email + password credentials
**When** the form POSTs to `/api/auth/login`
**Then** a session token is returned and stored
**And** I am redirected to the admin dashboard at `/admin`

**Given** I submit invalid credentials
**When** the API returns 401
**Then** I see an inline error: "Invalid credentials. Try again."
**And** I remain on the login page

**Given** I am not authenticated
**When** I visit any `/admin/*` URL
**Then** I am redirected to `/admin/login`

**Given** I mark "Remember Me"
**When** the login request is sent
**Then** the session expiry is extended

**Given** I submit the form
**When** the request is in-flight
**Then** the Sign In button shows a loading spinner and is disabled

**Given** I inspect the login form
**When** I tab through fields
**Then** the focus order follows visual order (Email → Password → Remember Me → Sign In)
**And** all fields have visible `<label>` elements (not placeholders as labels)

**UX-DR coverage:** UX-DR7 (Admin form fields), UX-DR13 (A11Y — visible labels, focus order)

#### Story 1.3: Admin Dashboard with shadcn Stat Widgets

As an **admin user (John)**,
I want **to see quick-stat widgets on the dashboard upon login**,
So that **I can see at-a-glance how many services, posts, messages, and subscribers exist**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** the dashboard at `/admin` loads
**Then** I see a grid of stat cards using shadcn/ui Card components for: Total Services, Published Blog Posts, Unread Messages, Subscribers
**And** each card shows the current count and an icon in a colored square (red for services, blue for posts, green for messages, amber for subscribers)

**Given** I create a new service in the admin
**When** I return to the dashboard
**Then** the "Total Services" stat shows the updated count

**Given** I click a stat card (e.g., "2 Unread Messages")
**When** the card is clickable
**Then** I am navigated to the corresponding admin list page

**Given** the database is empty
**When** the dashboard loads
**Then** stat cards show "0" and do not break layout

**Given** data is loading
**When** the dashboard first loads
**Then** skeleton placeholders appear for each stat card

**UX-DR coverage:** UX-DR7 (Stat Card visual spec), UX-DR12 (Admin states)

#### Story 1.4: Media Library Admin Page (Next.js)

As an **admin user (John)**,
I want **to upload, browse, and delete image files in a media library**,
So that **I can use those images in blog posts, team member photos, logos, and page content**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/media`
**Then** I see an upload button and a grid of uploaded media items with thumbnails, file names, sizes, and types

**Given** I upload a JPG/PNG/WebP/SVG file under 2MB
**When** the upload completes via POST `/api/media`
**Then** the file appears in the media grid with a thumbnail preview
**And** the file is stored in `storage/app/public/`

**Given** I upload a file larger than 2MB
**When** validation runs
**Then** I see inline error: "File too large. Max 2MB."

**Given** I upload an unsupported format (e.g., .gif, .pdf)
**When** validation runs
**Then** I see inline error: "Format not supported. Accepted: JPG, PNG, WebP, SVG."

**Given** I click delete on a media item
**When** the confirmation modal appears
**Then** clicking "Delete" permanently removes the file from storage and the grid

**Given** media items exist in the library
**When** the index page loads
**Then** items display as a responsive grid with file name, size, type, and thumbnail

**Given** the list is empty
**When** the page loads
**Then** I see an empty state: "No media yet. Upload your first file."

**Given** the list is loading
**When** the page first loads
**Then** skeleton grid items appear

**API endpoints implemented:**
- `GET /api/media` — returns list of media items
- `POST /api/media` — upload a file (multipart)
- `DELETE /api/media/{id}` — delete a media item

**UX-DR coverage:** UX-DR12 (Media states), UX-DR13 (A11Y)

#### Story 1.5: Public REST API — Scaffold, CORS, Rate Limiting, Contact & Subscribe Endpoints

As a **frontend developer**,
I want **the API infrastructure scaffolded with consistent JSON responses, CORS, rate limiting, and the contact/subscribe endpoints**,
So that **the API contract is established for all downstream domain epics to implement their GET endpoints**.

**Note:** This story creates the API scaffold and POST endpoints only. GET endpoints for domain resources (services, team, pages, blog posts, pricing plans, theme) are implemented in the epics that own that data (Epics 2-5), where the corresponding models are created.

**Acceptance Criteria:**

**Given** the API routes are defined in `routes/api.php`
**When** any endpoint returns a response
**Then** the response structure follows the consistent JSON:API-style envelope:
- Success: `{ "data": ... }`
- Validation error: `{ "message": "...", "errors": { "field": ["..."] } }`
- Server error: `{ "message": "..." }`

**Given** I declare API route groups in `routes/api.php`
**When** I check the route structure
**Then** route groups exist for: `pages`, `services`, `team`, `blog-posts`, `pricing-plans`, `theme`, `contact`, `subscribe`
**And** each group has empty controller methods or route stubs ready for domain epic implementation

**Given** I POST `/api/contact` with valid `name`, `email`, `message`
**When** validation passes
**Then** HTTP 201 with success message
**And** a new `ContactMessage` record is created in the database with `read_at: null`

**Given** I POST `/api/contact` with missing fields
**When** validation fails
**Then** HTTP 422 with `{ "message": "...", "errors": { "field": ["..."] } }`

**Given** I POST `/api/contact` more than 5 times in one minute from the same IP
**When** rate limiting triggers
**Then** HTTP 429 with rate limit message

**Given** I POST `/api/subscribe` with a valid email
**Then** HTTP 201 with success message
**And** a new `Subscriber` record is created

**Given** I POST `/api/subscribe` with a duplicate email
**Then** HTTP 422 with "already subscribed" message

**Given** I POST `/api/subscribe` more than 3 times in one minute from the same IP
**When** rate limiting triggers
**Then** HTTP 429

**Given** I GET `/api/nonexistent`
**Then** HTTP 404

**Given** a POST request with an `Origin` header from a non-deployed domain in production
**When** CORS middleware runs
**Then** the request is rejected

**Migrations created:** `contact_contact_messages` table, `contact_subscribers` table

**UX-DR coverage:** UX-DR13 (A11Y — error announcements via aria-describedby)

#### Story 1.6: Next.js 16 Frontend Scaffold & Theme Foundation

As a **visitor**,
I want **to see the public site skeleton with proper layout, navigation, and theme foundation**,
So that **the site is visually consistent and ready for content**.

**Acceptance Criteria:**

**Given** Next.js 16 is installed with `output: 'export'` in `next.config.ts`
**When** I run `npm run build`
**Then** it produces an `out/` directory with static HTML/CSS/JS files

**Given** the frontend is scaffolded
**When** I check the project structure
**Then** it has `app/`, `components/`, `lib/` directories
**And** Tailwind CSS v4 is installed and configured

**Given** the `ThemeProvider` component is implemented
**When** it renders at build time
**Then** it fetches `GET /api/theme` and writes CSS custom properties on `:root`
**And** the following CSS vars are defined: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-success`, `--color-error`, `--font-body`, `--font-heading`

**Given** the Tailwind config extends from CSS vars
**When** I use `bg-primary` or `text-primary` in any component
**Then** it resolves through `var(--color-primary)`

**Given** the public site layout is built
**When** I visit the homepage at `/`
**Then** it renders with Header (navbar), main content area, and Footer
**And** the Header includes: logo area, nav links (Home, Services, About, Pricing, Blog, Contact), and Login button
**And** the Footer includes: logo, company description, 3-column link grid, newsletter input, social icons, and back-to-top button

**Given** I view the site on mobile (≤767px)
**When** the nav links exceed the viewport
**Then** a hamburger menu appears instead of full nav links

**Given** I scroll past 300px on any page
**When** the back-to-top button appears
**Then** clicking it smooth-scrolls to the top of the page

**Given** the Laravel API is unreachable during `npm run build`
**When** the build process tries to fetch data
**Then** the build fails with a clear error message indicating the API is unreachable
**And** no broken/partial site is produced (NFR-8)

**UX-DR coverage:** UX-DR14 (Responsive breakpoints), UX-DR7 (Footer, Navbar), UX-DR13 (A11Y — skip-to-content link as first focusable element)

#### Story 1.7: Shared Zod Schemas Package

As a **developer**,
I want **Zod schemas in `packages/shared` that mirror the API response shapes**,
So that **the frontend has type safety and build-time validation matching the backend contract**.

**Acceptance Criteria:**

**Given** `packages/shared/` is set up as an npm workspace with `package.json` and `tsconfig.json`
**When** I check the `src/schemas/` directory
**Then** it contains schema files for: `page.ts`, `service.ts`, `team-member.ts`, `blog-post.ts`, `pricing-plan.ts`, `theme.ts`, `contact.ts`, `subscriber.ts`

**Given** the `page.ts` schema
**When** I inspect it
**Then** it validates: id (number), title (string), slug (string), hero_heading (string|null), hero_subtext (string|null), sections (JSON object|null), timestamps

**Given** the `blog-post.ts` schema
**When** I inspect it
**Then** it validates: id (number), title (string), slug (string), content (string), excerpt (string|null), featured_image_url (string|null), published_at (string|null), is_published (boolean), timestamps

**Given** the `pricing-plan.ts` schema
**When** I inspect it
**Then** it validates plan fields and includes a nested array of `PlanFeature` objects (description, is_included)

**Given** all schemas are exported from `src/index.ts`
**When** I import from `@amt/shared` in the frontend
**Then** I get typed inference for all API response shapes

### Epic 2: Core Site Content
Admin CRUD for services, team members, and homepage sections + public display on the frontend. After this epic, the public site shows the service offerings, team profiles, and editable homepage sections managed from admin.
**FRs covered:** FR-1 (Services), FR-4 (Team Members), FR-5 (Pages/Sections)

#### Story 2.1: Services Admin CRUD

As an **admin user (John)**,
I want **to create, edit, reorder, and delete service cards from the admin page**,
So that **I can manage the services displayed on the public site**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/services`
**Then** I see a table list with columns: Title, Icon, Sort Order, Featured, Created

**Given** I click "New Service"
**When** I fill in Title, Description, Icon (Font Awesome class selector), and toggle Featured
**Then** clicking Save creates the record and redirects to the list
**And** a notification shows "Saved."

**Given** I click an existing service
**When** I edit the fields
**Then** clicking Save updates the record

**Given** I click "Delete" on a service
**When** the confirmation modal appears
**Then** clicking "Delete" removes the record permanently

**Given** I have 3+ services
**When** I reorder them via drag-and-drop
**Then** `sort_order` is updated and the order persists on reload

**Given** the list is empty
**When** the page loads
**Then** I see an empty state: "No services yet. Create your first one."

**Given** the list is loading
**When** the page first loads
**Then** skeleton rows matching the column structure appear

**Given** I toggle the Featured switch on a service
**When** I save
**Then** the featured status is preserved on next load

**Fields:** title (required), description (required, textarea), icon (string, Font Awesome class like `fa-solid fa-code`), is_featured (boolean), sort_order (integer, auto-managed by reorder)

**UX-DR coverage:** UX-DR6 (Service Card data), UX-DR12 (Admin states), UX-DR9 (Table rows clickable → edit)

#### Story 2.2: Services Public Display

As a **visitor**,
I want **to see the agency's services displayed as cards on the homepage**,
So that **I understand what services they offer**.

**Acceptance Criteria:**

**Given** the homepage loads on desktop (≥992px)
**When** the services section renders
**Then** it shows a heading "Our Services" with a subtitle line
**And** service cards are displayed in a 4-column grid
**And** each card shows: icon (Font Awesome), title, description (truncated to 3 lines)
**And** featured services render with an accent top-border

**Given** the homepage loads on tablet (768-991px)
**When** the services section renders
**Then** cards display in a 2-column grid

**Given** the homepage loads on mobile (≤767px)
**When** the services section renders
**Then** cards display in a single column

**Given** the admin sets `is_featured = true` on a service
**When** the page renders
**Then** that card has a visual accent (top border colored with `var(--color-accent)`)

**Given** there are no services
**When** the section renders
**Then** it is visually hidden or shows a fallback message

**API endpoint implemented:** `GET /api/services` — returns services ordered by `sort_order` with HTTP 200 and `{ "data": [...] }` envelope

**Migrations created:** `marketing_services` table

**UX-DR coverage:** UX-DR6 (Service Card), UX-DR14 (Responsive breakpoints)

#### Story 2.3: Team Members Admin CRUD

As an **admin user (John)**,
I want **to manage team member profiles with photo uploads from the admin page**,
So that **I can keep the team section current**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/team-members`
**Then** I see a table list with columns: Photo (thumbnail), Name, Role, Sort Order, Created

**Given** I click "New Team Member"
**When** I fill in Name, Role, Bio, Photo (file upload), and Social Links (JSON)
**Then** clicking Save creates the record
**And** the uploaded photo is stored and linked to the model

**Given** I click an existing team member
**When** I update the photo
**Then** the old photo is replaced; the new one appears in the thumbnail

**Given** I reorder team members via drag-and-drop
**When** the order changes
**Then** `sort_order` is persisted

**Given** I upload a photo larger than 2MB or unsupported format
**When** validation runs
**Then** I see the appropriate inline error message

**Given** I click Delete
**When** the modal confirms
**Then** the record and associated file are removed

**Fields:** name (required), role (required), bio (textarea, optional), photo (single file, converted to `thumb` 150x150 crop + `profile` 400x400), social_links (JSON object: {linkedin, twitter} optional), sort_order (integer)

**UX-DR coverage:** UX-DR6 (Team grid), UX-DR12 (Admin states), UX-DR9 (Upload zone)

#### Story 2.4: Team Members Public Display

As a **visitor**,
I want **to see the team profiles on the homepage**,
So that **I know who runs the agency**.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the team section renders
**Then** it shows a heading "Meet Our Team"
**And** team member cards display in a grid (4-col desktop, 2-col tablet, 1-col mobile)
**And** each card shows: photo (rounded), name, role, bio (truncated 2 lines), social icons (LinkedIn, X/Twitter)

**Given** a team member has no social links
**When** the card renders
**Then** no social icons are displayed for that member

**Given** a team member has no photo
**When** the card renders
**Then** it shows a placeholder avatar (initials on muted background)

**Given** there are no team members
**When** the section renders
**Then** it is visually hidden

**API endpoint implemented:** `GET /api/team` — returns team members ordered by `sort_order` with HTTP 200 and `{ "data": [...] }` envelope

**Migrations created:** `marketing_team_members` table

**UX-DR coverage:** UX-DR6 (Team grid), UX-DR14 (Responsive)

#### Story 2.5: Pages Admin CRUD

As an **admin user (John)**,
I want **to manage homepage sections — hero, features, CTAs — from the admin page**,
So that **the public site content can be updated without touching code**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/pages`
**Then** I see a table list with columns: Title, Slug, Status (Published/Draft), Updated

**Given** I click "New Page"
**When** I fill in Title, Slug (auto-generated from title, editable), Hero Heading, Hero Subtext, and Sections
**Then** clicking Save creates the record

**Given** I edit the `sections` field of a page
**When** I use a textarea or JSON editor
**Then** the JSON is validated before save
**And** invalid JSON shows an inline error

**Given** I toggle a page between Published and Draft
**When** I save
**Then** only published pages appear on the public site via the API

**Given** I click Delete
**When** the modal confirms
**Then** the page is permanently removed

**Given** the list is empty
**When** the page loads
**Then** I see: "No pages yet. Create your first one."

**Fields:** title (required), slug (required, unique), hero_heading (nullable string), hero_subtext (nullable string), sections (nullable JSON — array of section objects with `type`, `heading`, `content`, `image`), is_published (boolean, default false)

**UX-DR coverage:** UX-DR12 (Admin states)

#### Story 2.6: Pages Public Frontend Display

As a **visitor**,
I want **to see the homepage with hero, sections, and all content managed from admin**,
So that **I get a professional first impression of the agency**.

**Acceptance Criteria:**

**Given** the homepage loads at `/`
**When** the page renders
**Then** it fetches the first published page from `GET /api/pages`
**And** renders the hero section with hero_heading and hero_subtext

**Given** the page has `sections` JSON array
**When** sections are rendered
**Then** each section renders according to its `type`:
- `hero` → full-width with large heading, subtext, optional CTA button
- `features` → icon-grid with heading + feature items
- `cta` → centered heading + subtext + button
- `content` → rich text block with heading + body
- **Unknown section types are silently skipped**

**Given** no published page exists
**When** the homepage loads
**Then** it shows a minimal hero: "Coming Soon" with the site name

**Given** I view the homepage on mobile (≤767px)
**When** the hero section renders
**Then** it is single-column with 40px padding
**And** all section types stack vertically

**Given** I view the homepage on desktop (≥992px)
**When** the hero section renders
**Then** it spans full width with the heading prominently large

**Given** sections contain images by URL
**When** they render
**Then** images are responsive with lazy loading (`loading="lazy"`)

**API endpoint implemented:** `GET /api/pages` — returns published pages with hero fields and sections as JSON, HTTP 200 with `{ "data": [...] }` envelope

**Migrations created:** `marketing_pages` table

**UX-DR coverage:** UX-DR2 (Typography tokens), UX-DR3 (Color tokens), UX-DR4 (Spacing tokens), UX-DR5 (Cards/Elevation tokens), UX-DR14 (Responsive)

### Epic 3: Pricing & Plans
Admin CRUD for pricing plans with feature lists + public pricing table with "Most Popular" ribbon, check/cross icons, and CTA scroll. After this epic, the pricing section of the public site is fully live and editable.
**FRs covered:** FR-2 (Pricing Plans + Features), FR-8 (Pricing Display)

#### Story 3.1: Pricing Plans Admin CRUD

As an **admin user (John)**,
I want **to create, edit, reorder, and delete pricing plans with their feature lists**,
So that **the pricing section reflects our current offers**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/pricing-plans`
**Then** I see a table list with columns: Name, Price, Interval, Most Popular, Sort Order, Status, Created

**Given** I click "New Plan"
**When** I fill in Name, Price (decimal), Interval (dropdown: Monthly/Yearly/One-time), Description, Is Most Popular (toggle), Is Published (toggle), and manage Plan Features (repeater)
**Then** clicking Save creates the plan with all nested features
**And** each feature row has: Description (text), Is Included (toggle)

**Given** I click an existing plan
**When** I edit the Price field
**Then** the decimal value is preserved exactly as entered

**Given** I reorder plans via drag-and-drop
**When** I save
**Then** `sort_order` persists on reload

**Given** I toggle "Most Popular" on a plan
**When** I save
**Then** if no other plan was marked Most Popular, this plan gets the badge
**And** if another plan had the badge, it is removed from that plan (only one Most Popular)

**Given** I manage a plan's features
**When** I add, edit, reorder, or remove rows in the feature repeater
**Then** the changes are saved and reflected on next edit

**Given** I click Delete on a plan
**When** the modal confirms
**Then** the plan and all associated features are removed

**Given** the list is empty
**When** the page loads
**Then** I see empty state: "No pricing plans yet. Create your first one."

**Fields (PricingPlan):** name (required), price (decimal 10,2, required), interval (enum: monthly|yearly|one-time), description (textarea, optional), is_most_popular (boolean), is_published (boolean, default false), sort_order (integer)
**Fields (PlanFeature — related):** description (required), is_included (boolean, default true), sort_order (integer)

**UX-DR coverage:** UX-DR6 (Pricing Card data), UX-DR12 (Admin states)

#### Story 3.2: Pricing Plans Public Display

As a **visitor**,
I want **to see a pricing table with feature comparisons and a CTA**,
So that **I can choose the right plan and take action**.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the pricing section renders
**Then** it shows a heading "Our Pricing" with subtitle
**And** published pricing plans display in a 3-column card grid (desktop)

**Given** a plan is marked as "Most Popular"
**When** the card renders
**Then** it has a "Most Popular" ribbon/badge at the top
**And** the card has a visual accent (e.g., primary border or elevated shadow)

**Given** a pricing plan card renders
**When** I inspect its contents
**Then** it shows: plan name, price (formatted as "₱{{price}}/{{interval}}"), description, feature list with green checkmarks (`fa-check`) for included features and red crosses (`fa-xmark`) for excluded features, and a CTA button "Get Started"

**Given** I am on a mobile device (≤767px)
**When** the pricing section renders
**Then** plans stack vertically in a single column

**Given** no published plans exist
**When** the pricing section renders
**Then** it is visually hidden or shows a fallback message

**Given** I click "Get Started" on any plan
**When** the CTA button is clicked
**Then** the page scrolls smoothly to the contact section (`#contact`)

**Given** the Most Popular plan exists
**When** the card grid renders
**Then** that card appears visually elevated (higher shadow, accented border) compared to other cards

**API endpoint implemented:** `GET /api/pricing-plans` — returns pricing plans ordered by `sort_order` with nested `features` array (description, is_included), HTTP 200 with `{ "data": [...] }` envelope

**Migrations created:** `billing_pricing_plans` and `billing_plan_features` tables

**UX-DR coverage:** UX-DR6 (Pricing Card), UX-DR14 (Responsive), UX-DR13 (A11Y — Most Popular announced via `aria-label`)

### Epic 4: Blog Engine
Admin CRUD for blog posts with Quill rich text editor, auto-save, publish toggle, slug management + public blog listing and single post pages. After this epic, John can write and publish blog posts from the admin page.
**FRs covered:** FR-3 (Blog Posts)

#### Story 4.1: Blog Posts Admin CRUD

As an **admin user (John)**,
I want **to create, edit, publish/unpublish, and delete blog posts with Quill rich text editing and featured images**,
So that **I can manage the blog content entirely from the admin page**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/blog-posts`
**Then** I see a table list with columns: Title, Author, Status (Published/Draft), Featured Image thumbnail, Published At, Updated

**Given** I click "New Blog Post"
**When** I fill in Title, Slug (auto-generated from title, editable), Content (Quill rich text editor), Excerpt (textarea), Featured Image (file upload), Is Published (toggle), Published At (datetime picker, conditional — only shown when Is Published is true)
**Then** clicking Save creates the post
**And** if Is Published is true and Published At is empty, Published At is set to now

**Given** I am editing a blog post with Quill
**When** I type content
**Then** every 30 seconds the draft is auto-saved to the database (Quill auto-save)
**And** a subtle indicator shows "Draft saved" on save

**Given** I upload a featured image
**When** the file is selected
**Then** it uploads to the server
**And** file validation rules apply (2MB max, JPG/PNG/WebP/SVG only)

**Given** I toggle a post from Published to Draft
**When** I save
**Then** the post no longer appears in the public API response

**Given** I click Delete on a post
**When** the modal confirms
**Then** the post and associated media files are removed

**Given** the list is empty
**When** the page loads
**Then** I see empty state: "No posts yet. Create your first one."

**Fields:** title (required), slug (required, unique), content (required, rich text — Quill HTML), excerpt (textarea, optional, max 300 chars), featured_image (single file), is_published (boolean, default false), published_at (datetime, nullable, auto-set on first publish)

**UX-DR coverage:** UX-DR9 (Quill auto-save draft), UX-DR12 (Admin states)

#### Story 4.2: Blog Public Listing Page

As a **visitor**,
I want **to browse published blog posts on `/blog`**,
So that **I can read agency updates and insights**.

**Acceptance Criteria:**

**Given** I visit `/blog`
**When** the page loads
**Then** I see a heading "Blog" with subtitle
**And** a grid of blog post cards

**Given** a blog card renders
**When** I inspect it
**Then** it shows: featured image (16:9 aspect ratio), title, excerpt (truncated 2 lines), published date (formatted "Month DD, YYYY"), and "Read More" link

**Given** there are more than 6 posts
**When** the listing renders
**Then** pagination controls appear at the bottom (Previous/Next or page numbers)

**Given** I am on mobile (≤767px)
**When** the listing renders
**Then** cards stack in a single column

**Given** I am on desktop (≥992px)
**Then** cards display in a 3-column grid

**Given** I click a blog card or "Read More"
**When** I interact
**Then** I navigate to `/blog/{slug}`

**Given** no published posts exist
**When** the page loads
**Then** I see a message: "No posts yet. Check back soon."

**Given** a post has no featured image
**When** the card renders
**Then** it shows a muted placeholder with the blog icon

**API endpoint implemented:** `GET /api/blog-posts` — returns published posts ordered by `published_at` descending, excerpt only (not full content), with pagination support (6 per page), HTTP 200 with `{ "data": [...] }` envelope

**Migrations created:** `marketing_blog_posts` table

**UX-DR coverage:** UX-DR6 (Blog Card), UX-DR14 (Responsive), UX-DR9 (Pagination)

#### Story 4.3: Blog Single Post Page

As a **visitor**,
I want **to read a full blog post at `/blog/{slug}`**,
So that **I can consume the complete content**.

**Acceptance Criteria:**

**Given** I visit `/blog/a-sample-post`
**When** the post exists and is published
**Then** I see: featured image (full-width hero), title, published date, author (hard-coded "Adsvance Media Tech"), and the full rich text content rendered as HTML

**Given** the rich text content contains headings, paragraphs, lists, images, links, and potentially malicious HTML (script tags, event handlers, iframe injections)
**When** it renders on the public site
**Then** all safe HTML (headings, lists, links, images, bold, italic) passes through
**And** disallowed tags (`<script>`, `<iframe>`, `<style>`, `<object>`, `<embed>`) are stripped
**And** all HTML is sanitized via HTMLPurifier (or equivalent) before output (NFR-4)

**Given** I visit `/blog/nonexistent-slug`
**When** no published post matches
**Then** I see a 404 page: "Post not found" with "Go to Blog" button

**Given** I visit `/blog/` directly
**When** the post page loads
**Then** a "← Back to Blog" link at the top navigates to `/blog`

**Given** a blog post image is large
**When** it renders
**Then** it is responsive with `max-width: 100%` and `loading="lazy"`

**Given** the post content is very long
**When** it renders
**Then** it has a max-readable width (~720px) for comfortable reading

**API endpoint implemented:** `GET /api/blog-posts/{slug}` — returns the full published blog post including rich text content by URL slug, HTTP 200 with `{ "data": { ... } }` envelope; returns HTTP 404 if slug not found

**UX-DR coverage:** UX-DR6 (Full post display), UX-DR13 (A11Y — proper heading hierarchy), UX-DR14 (Responsive)

### Epic 5: Theme System
Custom admin page in Next.js for theme settings (colors, fonts, logos) with live preview panel + CSS custom property generation in the Next.js frontend at build time. After this epic, the entire site can be rebranded without touching code.
**FRs covered:** FR-6 (Theme Settings), FR-7 (Theme Frontend Application)

#### Story 5.1: Theme Settings Admin Page

As an **admin user (John)**,
I want **a custom admin page where I can edit colors, fonts, and logos with a live preview**,
So that **I can rebrand the entire site without touching code**.

**Acceptance Criteria:**

**Given** I am logged into the admin page
**When** I navigate to `/admin/settings/theme`
**Then** I see a settings page split into sections: Colors, Fonts, Logos
**And** the layout uses a two-column split: settings form (left) and live preview panel (right)

**Given** I am in the Colors section (collapsible, expanded by default)
**When** I inspect the fields
**Then** each color has: a labeled color swatch input + a hex text input that sync bidirectionally
**And** the editable colors are: Primary, Secondary, Accent, Background, Foreground, Muted, Muted Foreground, Border, Success, Error
**And** default values match the two-skin spec:
- Skin A (AMT): Primary #FF0000, Secondary #1e1b2e, Accent #FF6B35, Background #FFFFFF, Foreground #1A1A2E
- Skin B (Alternative): Primary #2563EB, Secondary #0F172A, Accent #F59E0B, Background #F8FAFC, Foreground #0F172A
**When** I change the Primary color swatch to `#00FF00`
**Then** the hex input shows `#00FF00` in real-time
**And** the live preview panel updates the primary-colored elements

**Given** I change any color value
**When** the input changes
**Then** the preview panel updates in real-time without saving
**And** no changes are persisted until I click "Save"

**Given** I am in the Fonts section (collapsible)
**When** I inspect the fields
**Then** I see two dropdowns: Body Font and Heading Font
**And** the dropdown options include: Inter, Poppins, Roboto, Open Sans, Lato, Montserrat, Playfair Display, Merriweather

**Given** I am in the Logos section (collapsible)
**When** I inspect the fields
**Then** I see three upload zones: Light Logo (for dark backgrounds), Dark Logo (for light backgrounds), Favicon
**And** each zone supports click-to-upload and drag-and-drop
**And** the current logo is shown as a preview thumbnail
**And** each upload follows file validation rules (2MB max, JPG/PNG/WebP/SVG)

**Given** I click "Save"
**When** the form is valid
**Then** a green notification shows "Saved."
**And** the settings are persisted to the database

**Given** there are no existing theme settings
**When** the page loads
**Then** it populates with the default skin (Skin A: AMT values)

**Given** I change a color value but don't save
**When** I navigate away
**Then** the changes are lost (no auto-discard warning — explicit save is required)

**UX-DR coverage:** UX-DR7 (Settings section: white card with collapsible headers), UX-DR9 (Color picker + hex sync, Logo upload zones)

#### Story 5.2: Theme CSS Custom Property Generation (Frontend)

As a **visitor**,
I want **the public site to display with the admin-configured theme colors, fonts, and logos**,
So that **the site reflects the current branding automatically**.

**Acceptance Criteria:**

**Given** the frontend builds with `npm run build`
**When** the build process runs
**Then** it fetches `GET /api/theme` at build time
**And** generates CSS custom properties on `:root` in the global stylesheet

**Given** the theme API returns values
**When** CSS variables are generated
**Then** the following `:root` variables are set:
```
--color-primary: {primary}
--color-secondary: {secondary}
--color-accent: {accent}
--color-background: {background}
--color-foreground: {foreground}
--color-muted: {muted}
--color-muted-foreground: {muted-foreground}
--color-border: {border}
--color-success: {success}
--color-error: {error}
--font-body: '{body_font}', sans-serif
--font-heading: '{heading_font}', sans-serif
```

**Given** the Tailwind CSS v4 config
**When** I use utility classes like `bg-primary`, `text-primary`, `font-body`, `font-heading`
**Then** they resolve through the corresponding `var(--color-*)` or `var(--font-*)`

**Given** the logo URLs are available in the theme
**When** the public site renders
**Then** the navbar and footer use the configured light or dark logo based on the background
**And** the favicon uses the configured favicon URL

**Given** the API call fails or returns empty
**When** the site loads
**Then** it falls back to Skin A defaults (Primary #FF0000, Secondary #1e1b2e, etc.)
**And** the fallback logo is the AMT wordmark

**Given** the admin updates theme settings and rebuilds the frontend
**When** the new static export is deployed
**Then** the public site shows the updated theme on next load

**API endpoint implemented:** `GET /api/theme` — returns theme settings as key-value pairs, HTTP 200 with `{ "data": { "primary": "#FF0000", ... } }` envelope

**Migrations created:** `theming_theme_settings` table

**UX-DR coverage:** UX-DR2 (Typography tokens), UX-DR3 (Color tokens), UX-DR4 (Spacing tokens), UX-DR5 (Cards/Elevation tokens)

### Epic 6: Contact & Lead Capture
Contact form and newsletter subscription on the public site with database storage, inline state patterns, email notification via queued jobs, and rate limiting. After this epic, visitors can reach out and John gets notified.
**FRs covered:** FR-9 (Contact Form), FR-10 (Newsletter Subscription)

#### Story 6.1: Contact Form — Public UI & API Integration

As a **visitor**,
I want **to send a message through the contact form with clear feedback on every outcome**,
So that **I can get in touch with the agency**.

**Acceptance Criteria:**

**Given** the homepage loads
**When** I scroll to the contact section (`#contact`)
**Then** I see a heading "Get in Touch" with subtitle
**And** a form with fields: Name (text input), Email (email input), Message (textarea)
**And** each field has a visible `<label>` (no placeholder as label)
**And** a submit button labeled "Send Message"

**Given** I submit the form with all valid fields
**When** the API returns success (POST `/api/contact` returns HTTP 201)
**Then** the form shows an inline green success message: "Thanks! We'll get back to you soon."
**And** the message auto-fades after 5 seconds
**And** the form resets to empty fields

**Given** I submit with empty or invalid fields
**When** the API returns HTTP 422
**Then** inline red error messages appear below each invalid field
**And** the fields retain their entered values (not cleared)
**And** each error message is linked via `aria-describedby` on the input

**Given** the API returns HTTP 429 (rate limited)
**When** rate limiting triggers (>5 submissions/minute from same IP)
**Then** the form shows a red message: "Too many submissions. Try again in a minute."
**And** the submit button is disabled for 60 seconds

**Given** I submit the form
**When** the request is in-flight
**Then** the submit button shows a loading state (spinner) and is disabled
**And** a polite `aria-live="polite"` region announces the status

**Given** the API returns a 500 error
**When** the request fails
**Then** the form shows: "Something went wrong. Please try again."
**And** fields retain their values

**Given** I focus the form fields
**When** I tab through
**Then** the focus order follows visual order (Name → Email → Message → Submit)

**UX-DR coverage:** UX-DR10 (Contact form states — idle, success, error, rate-limited), UX-DR13 (A11Y — labels, aria-describedby, aria-live)

#### Story 6.2: Newsletter Subscribe — Public UI & API Integration

As a **visitor**,
I want **to subscribe to the newsletter with my email**,
So that **I get agency updates and news**.

**Acceptance Criteria:**

**Given** the homepage footer renders
**When** I see the newsletter section
**Then** it shows a heading "Subscribe to Our Newsletter", a single email input with visible label, and a "Subscribe" button

**Given** I enter a valid email and click Subscribe
**When** the API returns success (POST `/api/subscribe` HTTP 201)
**Then** the input is replaced inline with a green message: "Subscribed!"
**And** the input clears

**Given** I enter an email that already exists
**When** the API returns HTTP 422 with duplicate message
**Then** the input shows a red inline message: "Already subscribed."
**And** the input retains its value

**Given** I enter an invalid email format
**When** the API or client-side validation catches it
**Then** an inline red validation error appears: "Please enter a valid email address."
**And** the input retains its value

**Given** I submit more than 3 times in one minute from the same IP
**When** rate limiting triggers
**Then** the form shows: "Too many attempts. Try again in a minute."
**And** the submit button is disabled

**Given** the API returns a 500 error
**When** the request fails
**Then** the form shows: "Something went wrong. Please try again."

**Given** I submit the form
**When** in-flight
**Then** the button shows a loading state

**UX-DR coverage:** UX-DR11 (Newsletter states — success, duplicate, invalid), UX-DR13 (A11Y)

#### Story 6.3: Email Notification for Contact Messages

As an **admin user (John)**,
I want **to receive an email notification when someone submits the contact form**,
So that **I can respond to leads promptly**.

**Acceptance Criteria:**

**Given** a visitor submits a valid contact form
**When** the API stores the `ContactMessage`
**Then** a queued job (`SendContactNotification`) is dispatched to the `queue` connection

**Given** the job runs
**When** it processes
**Then** it sends an email to the configured notification address (`MAIL_NOTIFICATION_ADDRESS` from `.env`, default: johnpaulnarvasa6@gmail.com)
**And** the email contains: visitor name, visitor email, message body, and timestamp

**Given** the queue worker is running (`php artisan queue:work`)
**When** the job is processed
**Then** the email is sent via the configured mail driver (default: `log` for local dev, SMTP in production)

**Given** the mail driver is `log` (local dev)
**When** the job runs
**Then** the email content is written to `storage/logs/laravel.log`

**Given** `.env` has `MAIL_NOTIFICATION_ADDRESS` set
**When** the job reads the config
**Then** it uses that address as the `To` recipient

**Given** `.env` does not have `MAIL_NOTIFICATION_ADDRESS` set
**When** the job reads the config
**Then** it falls back to the default: johnpaulnarvasa6@gmail.com

**Given** the contact form receives many submissions
**When** each one creates a `ContactMessage`
**Then** each submission triggers a separate queued notification job
**And** jobs are processed in the order they were received (FIFO via default database queue)

**UX-DR coverage:** UX-DR10 (Success state — user sees success before email is queued)
