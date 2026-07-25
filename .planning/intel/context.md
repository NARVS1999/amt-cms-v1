# Context

## Project Description
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- Adsvance Media Tech CMS v1.0 — CMS that powers the company's marketing website and serves as a reusable, themeable CMS foundation for client projects. Swapping the logo, changing the primary color, filling in content gives a client their own CMS-driven site without writing code. Not a WordPress competitor — purpose-built for templated business sites.

## Target Users
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- Primary: Adsvance's internal team (John). Secondary: clients who receive the CMS as a product. Non-users v1: end-customers visiting client sites, multi-tenant/SaaS hosting, developers wanting a headless CMS.

## Key User Journeys
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- UJ-1: John updates pricing before a client call. UJ-2: John onboards a new client with branded CMS. UJ-3: Visitor submits contact form. UJ-4: John writes a blog post from admin panel.

## Success Metrics
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- SM-1: John can update any marketing content through admin and see it live within 5 minutes of rebuild. SM-2: New client deployment with brand customization under 2 hours. SM-3: Blog post from "New Post" to public live under 3 minutes. SM-C1 (counter-metric): Admin panel complexity — lean first, extend later.

## Non-Goals (v1)
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- Not drag-and-drop page builder, not multi-tenant, not real-time collaborative editing, not WordPress/Shopify replacement, not e-commerce, not multilingual, not first-run setup wizard.

## Architecture Overview
- source: docs/architecture/overview.md
- Flat MVC: Laravel organizes by layer not domain. 12 models across 6 domains: Marketing (Service, TeamMember, Page, BlogPost), Billing (PricingPlan, PlanFeature), Contact (ContactMessage, Subscriber), Media (Media, MediaLibrary), Theme (ThemeSetting), Auth (User). 10 controllers, 15 migration files, PHPUnit feature tests.

## Error Handling — HTTP Status Codes
- source: docs/ERROR-HANDLING.md
- 200 Success (GET/PUT/DELETE), 201 Created (POST), 400 Bad request, 401 Unauthenticated, 403 Forbidden, 404 Not found, 422 Validation failure, 429 Rate limited, 500 Server error. Frontend: 401 redirects to login, 422 inline validation, 429 disables button 60s, 500 red toast.

## Error Handling — Known Implementation Bugs
- source: docs/ERROR-HANDLING.md
- GET /api/blog-posts returns all posts including drafts (needs ->where('is_published', true)). No admin-specific GET /api/admin/pricing-plans (admin uses public route filtering out unpublished plans). PricingPlanResource uses whenLoaded but features always loaded. MediaController does not use ApiResponse trait. Duplicate interfaces in admin-api.ts and api.ts may drift.

## Error Handling — Known Edge Cases
- source: docs/ERROR-HANDLING.md
- Two plans marked is_popular: controller clears previous first. Price=0 accepted (min:0). Features with missing descriptions default to empty string. Published toggle ON with no published_at auto-sets to now(). Draft posts in public API: BlogPostController@index does NOT filter by is_published. Delete media used by blog post: featured_image_url becomes broken link (no cascade). Same email different case: treated as different (MySQL default case-sensitive VARCHAR).

## Configuration
- source: docs/configuration/configuration.md
- Backend .env: DB_CONNECTION=mariadb, DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE=adsvance_cms, SESSION_DRIVER=database, QUEUE_CONNECTION=database, CACHE_STORE=database, MAIL_MAILER=log (dev) / smtp (prod). Frontend: NEXT_PUBLIC_API_URL defaults to http://localhost:8000/api.

## Development Guide
- source: docs/guides/development.md
- Backend: php artisan serve (port 8000), test, migrate. Frontend: npm run dev (port 3000), npm run build (SSG output to out/), npx tsc --noEmit, npm run lint. Adding resource: Migration -> Model with HasFactory -> Factory -> API Resource -> Controller -> Routes -> Feature tests.

## Getting Started
- source: docs/guides/getting-started.md
- Prerequisites: PHP 8.2+, Composer 2.x, Node.js 18+, MariaDB 10.4+/MySQL 8.x. Clone, composer install in apps/backend, cp .env.example .env, php artisan key:generate, migrate, storage:link, serve. Frontend: npm install, npm run dev.

## Implementation Readiness
- source: docs/implementation-readiness-report-2026-07-18.md
- Overall: READY. 14/14 FRs in-scope for v1.0 covered (100%). 2 critical violations resolved (Epic 1 restructuring). Issues: NFR-4 (Content Sanitization) missing explicit story, NFR-8 (Graceful Degradation) missing explicit story, NFR-2 (API caching) partially covered. Recommendations: resolve SSG build trigger decision, confirm Skin B defaults, confirm Page model scope, add accessibility audit story.

## Testing
- source: docs/testing/testing.md
- PHPUnit 11.x with SQLite :memory: (RefreshDatabase trait). 8 Feature test classes: ServicesTest, TeamMembersTest, PagesTest, BlogPostsTest, PricingPlansTest, ContactSubscribeTest, MediaTest, StatsTest. No frontend test suite configured. Verification: php artisan test (backend), npx tsc --noEmit && npm run lint && npm run build (frontend).

## UX Design — Visual Identity
- source: docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md
- Two surfaces under one brand. Public: warm, Poppins, bold red primary (#FF0000), amber accent (#FFC107), card-based. Admin: cold, Inter, dark sidebar (#1e1b2e), red primary as connective token. 60+ design tokens across colors, typography, rounded corners, spacing, elevation, components. Public buttons pill radius (50px), service cards 10px radius 1px border, pricing cards with popular ribbon. Admin sidebar 260px dark panel, stat cards white 10px radius, tables clean header with bottom border rows.

## UX Design — Experience
- source: docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md
- 11 surfaces: P1 Homepage, P2 Blog Listing, P3 Blog Post, P4 404, A1 Admin Login, A2 Dashboard, A3 Services, A4 Pricing Plans, A5 Blog Posts, A6 Team, A7 Pages, A8 Theme, A9 Media, A10 Messages (v1.1), A11 Subscribers (v1.1). Public nav: single-page anchor scroll. Admin nav: persistent left sidebar with groups (Main/Leads/Settings). State patterns: Loading (skeleton rows), Empty (illustration + action), Save success (green toast 3s), Save failure (red toast persistent), Delete confirmation (modal), Session expired (redirect), Permission denied (403). WCAG 2.2 AA across both surfaces.

## Epic Breakdown — Requirements Inventory
- source: docs/epics.md
- 6 Epics: Epic 1 Foundation (auth, API, admin shell), Epic 2 Core Site Content (services, team, pages), Epic 3 Pricing & Plans, Epic 4 Blog Engine, Epic 5 Theme System, Epic 6 Contact & Lead Capture. Detailed Given/When/Then acceptance criteria for each story. All 15 FRs mapped to stories. Additional architecture requirements (AD-1 through AD-8) and UX design requirements (UX-DR1 through UX-DR17) documented.

## Project Context — Implementation Rules
- source: docs/project-context.md
- 84 implementation rules for AI agents organized by: technology stack, language-specific rules (PHP: no raw SQL; TypeScript: strict mode, RSC by default), framework rules (Laravel: flat structure, FormRequest validation; Next.js: output:export, no getServerSideProps), testing rules, code quality, accessibility (WCAG 2.2 AA), workflow. Architecture invariants: no hardcoded brand colors, no SSG violation, no raw SQL. Content model gotchas: only one Most Popular plan, blog slugs auto-generate admin-overridable, published filtering at query level, contact message read_at defaults to null.
