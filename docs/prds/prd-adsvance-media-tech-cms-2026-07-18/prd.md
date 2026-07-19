---
title: Adsvance Media Tech CMS v1.0
status: draft
created: 2026-07-18
updated: 2026-07-18
---

# PRD: Adsvance Media Tech CMS v1.0
*Working title — confirm.*

## 0. Document Purpose

This PRD defines v1.0 of the Adsvance Media Tech CMS — the product that powers the company's marketing website and serves as a reusable, themeable CMS foundation for client projects. It is written for the product owner (John), the development team, and downstream workflows (UX, architecture, epics). Features are grouped by domain with globally numbered FRs. `[ASSUMPTION]` tags mark inferred decisions needing confirmation. Technical architecture and build sequencing are captured in the companion `addendum.md`.

---

## 1. Vision

Adsvance Media Tech builds websites for small businesses in the Philippines — templated, affordable, and fast. But today their own marketing site is a static HTML page with no backend: every content change means editing markup, every new client means starting from scratch.

The Adsvance Media Tech CMS changes that. It's a clean, reusable content management system built on Laravel + Next.js that does two things: powers Adsvance's own marketing site with an admin panel where every word, price, and image is editable, and serves as a ready-made foundation for client projects. Swap the logo, change the primary color, fill in the content — and a client has their own CMS-driven site without writing a line of code.

We're not building a generic WordPress competitor. We're building the specific tool Adsvance needs to run their business *and* the base they hand to every client. Reusability is not an afterthought — it's the architecture.

---

## 2. Target User

### 2.1 Jobs To Be Done

**For Adsvance's internal team (primary):**
- "I want to update our services, pricing, or team page without touching HTML."
- "I want to add a blog post and have it live immediately."
- "I want to change the site's look (colors, logo) through a settings page, not CSS."
- "I want to see contact form submissions without checking an email inbox."
- "I want to spin up a CMS for a new client in under an hour."

**For clients (secondary — CMS as a product):**
- "I want a website I can edit myself without learning code."
- "I want it to match my brand colors and logo."
- "I want pricing tiers and services that I control."

### 2.2 Non-Users (v1)
- End-customers visiting client sites — they interact with the frontend only, never the admin panel.
- Multi-tenant / SaaS hosting — each client gets their own deployment, not a shared dashboard.
- Developers wanting a headless CMS with a rich plugin ecosystem.

### 2.3 Key User Journeys

**UJ-1. John updates the pricing page before a client call.**
John logs into the admin panel at `/admin`. He navigates to Pricing Plans, edits the Ultimate plan price from ₱898 to ₱948, and hits Save. He opens the public site in a new tab — the new price is live after the next build.
- **Edge case:** if John mistypes a non-numeric character, the price field rejects it with inline validation before saving.

**UJ-2. John onboards a new client with a branded CMS.**
John deploys a fresh copy, logs into the admin panel, and opens Theme Settings. He uploads the client's logo (light and dark variants), sets their primary color to blue (`#2563EB`), and changes the company name. The public site repaints after rebuild. He populates services, team, and pricing through the admin. Within an hour the client has a working branded site.
- **Edge case:** if the uploaded logo is too large (>2MB), the media library shows a clear error before attempting upload.

**UJ-3. A visitor submits a contact form.**
A visitor fills out name, email, and message on the Contact section and hits Send. The system saves the message to the database and sends a notification email to the configured address. John sees it in his inbox. The visitor sees a success message.
- **Edge case:** if the email server is down, the message is still saved in the database with an `unread` status; a queued job retries email delivery.

**UJ-4. John writes a blog post from the admin panel.**
John clicks "New Post" in the Blog section, enters a title, writes the body using the rich text editor (bold, headings, images, links), sets "Published" to true, and hits Save. The post appears on the public blog listing, sorted by date, with a clean URL like `/blog/new-pricing-announcement`.
- **Edge case:** if John saves with an empty title, the form prevents submission and highlights the title field.

---

## 3. Glossary

- **CMS** — Content Management System. The combined Laravel backend + Next.js frontend.
- **Admin Panel** — The shadcn-powered dashboard at `/admin` in Next.js where staff manage content.
- **Theme Settings** — Configurable brand values (colors, fonts, logos) that repaint the public site.
- **SSG** — Static Site Generation. Next.js builds flat HTML/JS files at deploy time, served by Hostinger without a Node runtime.
- **Sample Data** — Pre-seeded content matching the legacy site so the CMS isn't empty on first deploy.
- **Monorepo** — A single git repository containing `apps/backend` (Laravel), `apps/frontend` (Next.js), and `packages/shared` (shared schemas).
- **shadcn/ui** — Open-source React component library used for admin panel UI.
- **Quill** — Open-source rich text editor used in the blog post composer.

---

## 4. Features

### 4.1 Marketing Content Management

**Description:** Full CRUD for the public site's marketing content — pages, services, team members, and blog posts. Realizes UJ-1, UJ-4. All content is managed through the admin panel and served to the public frontend via a REST API. `[ASSUMPTION: each "Page" models a single section of the homepage (hero, about, etc.) plus any standalone pages — not a full drag-and-drop page builder. A flexible JSON `sections` field on the Page model provides structural flexibility within bounds.]`

**Functional Requirements:**

#### FR-1: Manage Services
Admin can create, read, update, delete, and reorder services (icon as Font Awesome class name, title, description). Realizes UJ-1.

**Consequences (testable):**
- Services appear on the homepage in the order set in admin.
- Deleting a service removes it from the public site immediately.
- The icon field accepts valid Font Awesome class names.

**Out of Scope:**
- Service-specific landing pages (deferred to v1.1).

#### FR-2: Manage Pricing Plans
Admin can create, read, update, delete, and reorder pricing plans. Each plan has a name, monthly price (PHP numeric), a "Most Popular" toggle, a CTA text, and a list of features (each feature: description + included/not-included flag). Realizes UJ-1.

**Consequences (testable):**
- Plans appear on the pricing section in admin-set order.
- "Most Popular" plan shows a ribbon badge on the public site.
- Price field validates for numeric input only.
- Deleting a plan cascades to remove its features.

#### FR-3: Manage Blog Posts
Admin can create, read, update, delete blog posts with title, auto-generated slug (overridable), rich text content (via Quill), excerpt, featured image, and published-at date. A "Published" toggle controls visibility. Realizes UJ-4.

**Consequences (testable):**
- Published posts appear on `/blog` sorted by date descending.
- Unpublished posts do not appear on the public site.
- Slug auto-generates from title; admin can override.
- Rich text content renders safely on the public site (sanitized HTML).

#### FR-4: Manage Team Members
Admin can create, read, update, delete, and reorder team members with name, role, photo upload, and bio. Realizes UJ-1 (team section authorship).

**Consequences (testable):**
- Team section on the public site reflects admin-set order.
- Photo upload accepts JPG, PNG, WebP up to 2MB.

#### FR-5: Manage Pages / Site Sections
Admin can update key homepage sections (hero heading, hero subtext, hero image, about content, video embed URL). `[ASSUMPTION: managed as Page records where each Page has a slug identifier, hero fields, and a flexible JSON `sections` field for structured content blocks.]`

**Consequences (testable):**
- Changing hero heading in admin updates the homepage on next build.
- JSON `sections` structure is validated on save against a known schema.

### 4.2 Theme System

**Description:** A settings-driven theming engine that lets admin change the entire site's visual identity without touching code. Realizes UJ-2. Theme values are fetched by the Next.js frontend at build time and compiled into CSS custom properties.

**Functional Requirements:**

#### FR-6: Manage Theme Settings
Admin can set primary color, secondary color, accent color, body font, heading font, light logo image, dark logo image, and favicon through a dedicated Theme Settings page in the admin panel.

**Consequences (testable):**
- Changing primary color from `#ff0000` to `#2563EB` repaints all primary-colored elements site-wide.
- Uploading a new logo replaces it across all header/footer locations.
- Color inputs validate hex format; font inputs validate as known Google Font names.
- Empty theme settings fall back to sensible defaults (legacy red scheme).

#### FR-7: Theme Application (Frontend)
The Next.js frontend fetches `/api/theme` at build time and generates CSS custom properties (`--color-primary`, `--color-secondary`, `--color-accent`, `--font-body`, `--font-heading`) on `:root`. Tailwind CSS extends its config from these values.

**Consequences (testable):**
- The `ThemeProvider` correctly resolves all theme CSS vars into the global stylesheet.
- All components using `var(--color-primary)` repaint correctly when the value changes.
- A theme change triggers a rebuild to reflect on the public site (SSG nature — acceptably fast with a manual or CI rebuild).

**Feature-specific NFRs:**
- Theme application must not break existing styles — graceful fallback to default values.

### 4.3 Billing / Pricing

**Description:** The public pricing section displays Adsvance's service packages. Admin manages plans and features. Realizes UJ-1.

**Functional Requirements:**

#### FR-8: Display Pricing Table
The public frontend renders a responsive pricing table (Basic, Premium, Ultimate) with plan name, price (₱), feature list with check/cross icons, CTA button, and a "Most Popular" ribbon on the designated plan.

**Consequences (testable):**
- Table matches the legacy site's 3-column pricing layout.
- Features marked `included: true` show a green check icon; `included: false` show a red X.
- CTA button links to the contact form section on the same page. `[ASSUMPTION: CTA scrolls to contact section — confirm desired behavior.]`

### 4.4 Contact / Lead Management

**Description:** Contact form submissions and newsletter signups are captured, stored in the database, and notified via email. Realizes UJ-3.

**Functional Requirements:**

#### FR-9: Contact Form Submission
Public visitors can submit name, email, and message through the contact form. The system saves the submission to the database and dispatches a notification email to the configured recipient address.

**Consequences (testable):**
- Submission with all valid required fields returns a success message.
- Missing required fields (name, email, message) returns inline validation errors.
- Email is sent to the address configured in `.env` (`CONTACT_NOTIFICATION_EMAIL=johnpaulnarvasa6@gmail.com`).
- The message record is stored with `read_at: null` (unread status).

**Feature-specific NFRs:**
- Rate-limited: max 5 submissions per IP per minute.

#### FR-10: Newsletter Subscription
Public visitors can subscribe with their email address. `[ASSUMPTION: single-step subscription — no double opt-in for v1.]`

**Consequences (testable):**
- Duplicate email returns a clear "already subscribed" message.
- Invalid email format is rejected with validation feedback.
- Subscription is stored with `subscribed_at` timestamp.

**Feature-specific NFRs:**
- Rate-limited: max 3 subscriptions per IP per minute.

#### FR-11: Contact Message Management (Admin)
Admin can view all contact submissions, mark messages as read, and delete messages.

**Consequences (testable):**
- Unread messages are visually distinct (bold/highlighted).
- Deleting a message removes it permanently from the database.

### 4.5 Admin Panel

**Description:** The admin panel lives in the Next.js frontend at `/admin` using shadcn/ui components. All data flows through the Laravel REST API. Realizes all admin-facing UJs.

**Functional Requirements:**

#### FR-12: Admin Authentication
Admin users log in with email and password using a login form at `/admin/login` that authenticates against the Laravel API. Supports "Remember Me."

**Consequences (testable):**
- Unauthenticated users are redirected to `/admin/login`.
- Session expires after a configurable period of inactivity.

#### FR-13: Admin Dashboard
The admin dashboard displays quick-stat cards: total services, published blog posts, unread contact messages, newsletter subscriber count.

**Consequences (testable):**
- Widget counts update after relevant CRUD operations.
- Clicking a widget navigates to the corresponding resource list.

#### FR-14: Media Library
Admin can upload, browse, and delete media files through the admin panel. Uploaded files are available for use in blog posts, team photos, theme logos, and page images.

**Consequences (testable):**
- Accepted formats: JPG, PNG, WebP, SVG. Max file size: 2MB. `[ASSUMPTION: 2MB limit and format list are reasonable starting points — adjustable.]`
- Deleting a media file removes it from storage.
- Media can be attached to any model (blog post, team member, page, theme) through Spatie's relationship.

### 4.6 Public API

**Description:** REST JSON API endpoints consumed by the Next.js frontend at build time. Public GET endpoints do not require authentication. POST endpoints are rate-limited.

**Functional Requirements:**

#### FR-15: Public REST API
The Laravel backend exposes the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | All pages with hero and section data |
| GET | `/api/pages/{slug}` | Single page by slug |
| GET | `/api/services` | Services ordered by sort_order |
| GET | `/api/team` | Team members ordered by sort_order |
| GET | `/api/blog-posts` | Published blog posts sorted by date |
| GET | `/api/blog-posts/{slug}` | Single blog post with full content |
| GET | `/api/pricing-plans` | Plans with nested features |
| GET | `/api/theme` | Theme settings as key-value pairs |
| POST | `/api/contact` | Submit contact form (rate-limited) |
| POST | `/api/subscribe` | Subscribe to newsletter (rate-limited) |

**Consequences (testable):**
- All GET endpoints return HTTP 200 with a JSON body wrapped in a `data` key.
- POST endpoints return HTTP 201 on success, HTTP 422 on validation failure.
- Unknown routes return HTTP 404.
- All responses use consistent JSON:API-style structure.
- CORS headers restrict access to the deployed frontend domain.

---

## 5. Non-Goals (Explicit)

- **Not a drag-and-drop page builder.** Content follows structured fields, not a canvas.
- **Not multi-tenant.** Each deployment is a separate instance with its own database.
- **Not a real-time collaborative editor.** Single-user admin at a time.
- **Not a WordPress/Shopify replacement.** Purpose-built for templated business sites.
- **Not e-commerce.** No cart, no payments, no product inventory management.
- **Not multilingual in v1.** English only on the public site.
- **Not a first-run setup wizard.** Admin panel works immediately after seeding.

---

## 6. MVP Scope

### 6.1 In Scope (v1.0)

- Marketing content management: Services, Pricing Plans + Features, Blog Posts, Team Members, Pages/Sections — all with full CRUD in admin
- Theme System: primary/secondary/accent colors, fonts, logos — all manageable through admin
- Contact form with database storage and email notification to configurable address
- Newsletter subscription with database storage
- Admin panel (Next.js/shadcn): admin dashboard, authentication, content CRUD, media library
- Public REST API: all GET + POST endpoints with validation, rate limiting, CORS
- Next.js frontend with SSG: homepage (hero, services, about, video), pricing table, blog listing + single post, team grid, footer with newsletter form
- Mobile-responsive navigation: hamburger menu with slide-out drawer
- Back-to-top floating button
- Sample data seeded from legacy site content
- SSG build pipeline (local build → push static output to Hostinger)
- Local development environment (Laravel artisan serve + Next.js dev + XAMPP MySQL)

### 6.2 Out of Scope for MVP

| Item | Reason | Target |
|------|--------|--------|
| Contact message dashboard in admin | Email notification covers the gap | v1.1 |
| Subscriber management in admin | Low priority; data is in DB | v1.1 |
| Image auto-optimization/resizing on upload | Manual compression acceptable for v1 | v1.1 |
| SEO meta tag management in admin | Hardcoded meta tags sufficient | v1.1 |
| Analytics dashboard | Google Analytics snippet sufficient | v2 |
| Client onboarding wizard | John handles setup manually | v1.1 |
| Advanced page builder (drag-and-drop) | Structured content is sufficient | v2 |
| Multi-language support | English-only for foreseeable future | v3+ |

---

## 7. Cross-Cutting NFRs

### Performance
- Next.js SSG pages must load in under 2 seconds on Hostinger shared hosting (measured via Lighthouse Mobile).
- API GET endpoints must respond in under 200ms (with Laravel response caching).
- Maximum bundle size for Next.js: under 300KB JS + CSS total.

### Security
- Admin panel accessible only over HTTPS in production.
- CORS restricted to the deployed frontend domain.
- All API inputs validated via Laravel FormRequest classes.
- Rich text content sanitized before public render (HTMLPurifier or similar).
- Contact and subscribe endpoints rate-limited (5/min and 3/min respectively per IP).
- Admin passwords hashed via Laravel's default bcrypt. `[ASSUMPTION: Hostinger provides SSL/HTTPS — verify before deploy.]`
- SQL injection impossible via Eloquent ORM (no raw queries in v1).

### Reliability
- Contact form submissions survive email delivery failure — stored in DB regardless, with a queued retry.
- Laravel queue driver: database (no Redis dependency). Email dispatch failures retry up to 3 times.
- Graceful degradation: if the API is unreachable during Next.js build, the build fails with a clear error message rather than producing a broken site.

---

## 8. Constraints and Guardrails

### Hosting (Hostinger)
- Laravel runs on Hostinger's Business Shared plan (PHP 8.2 supported). `[ASSUMPTION: verify resource limits before first deploy.]`
- Next.js frontend deploys as static HTML/JS/CSS — no Node runtime on the server.
- MySQL database included in the Hostinger plan.
- Local development uses XAMPP's MariaDB 10.4 (MySQL-compatible).

### Budget
- Zero cost for software: Laravel, shadcn/ui, Next.js, Quill, Spatie packages, Font Awesome — all free/open-source.
- Hostinger shared hosting cost only (~$3-10/month). No paid APIs.

### Maintainability (Reusability)
- Monorepo structure allows extracting `apps/backend` or `apps/frontend` independently for client projects.
- Email notification recipient configurable via single `.env` variable (`CONTACT_NOTIFICATION_EMAIL`).
- Theme settings must not require code changes to customize — admin panel only.
- All configuration is environment-driven (`.env`), never hardcoded.

---

## 9. Platform

- **Form factor:** Web application, responsive mobile-first design.
- **Admin panel:** Desktop-first (responsive, optimized for larger screens).
- **Frontend output:** Static HTML/CSS/JS served from Hostinger's Apache/Nginx.
- **No mobile app, no PWA** in v1.
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions).

---

## 10. Success Metrics

**Primary**
- **SM-1:** John can update any marketing content through the admin panel and see it live on the public site within 5 minutes of rebuild. Validates FR-1 through FR-5.

**Secondary**
- **SM-2:** A new client deployment (full setup with brand customization + initial content) takes under 2 hours for a familiar operator. Validates FR-6, FR-7, FR-12.
- **SM-3:** Blog post goes from "New Post" click to public live in under 3 minutes. Validates FR-3.

**Counter-metrics (do not optimize)**
- **SM-C1:** Admin panel complexity. If adding a new content type requires more than one new model + one admin page + one API endpoint, the architecture is overengineered. Counterbalances all FRs — lean first, extend later.

---

## 11. Open Questions

1. **Hostinger plan specifics:** Does the Business Shared plan include sufficient MySQL storage and PHP memory (≥256MB) for Laravel? Must verify before deploy.
2. **SSG build pipeline:** How does the rebuild trigger? Options: (a) manual build on local machine + FTP upload, (b) GitHub Actions build on push → auto-deploy. Needs decision.
3. **Logo variants:** Should light and dark logos be separate upload fields, or a single logo with an auto-generated inverted variant? Separate fields is simpler for v1.
4. **Email deliverability:** Will Hostinger's built-in mail server handle form notifications reliably, or should we configure a free SMTP relay (SendGrid free tier / Mailgun)? Recommend confirming before v1 launch.
5. **Sample data:** Should sample data replicate the legacy site content exactly, or do you want revised/updated copy for the v1 launch?

---

## 12. Assumptions Index

| # | Assumption | Section |
|---|-----------|---------|
| A1 | Each "Page" models a single site section with a JSON `sections` field — not a full page builder | §4.1 |
| A2 | CTA button on pricing plans scrolls to the contact section | FR-8 |
| A3 | No double opt-in for newsletter — single-step subscribe | FR-10 |
| A4 | Max upload size 2MB; accepted formats JPG/PNG/WebP/SVG — adjustable | FR-14 |
| A5 | Hostinger Business Shared plan supports Laravel's PHP 8.2 requirements | §8 |
| A6 | Hostinger provides SSL/HTTPS for the deployed domain | §7 |
| A7 | Admin is comfortable with manual/local rebuild and FTP for initial deploys (CI can come later) | OQ-2 |
| A8 | Project repo name: `adsvance-media-tech-cms` | General |
