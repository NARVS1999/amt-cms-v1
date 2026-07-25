# Decisions

## AD-1: Flat Laravel structure
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: All models in app/Models/, controllers in app/Http/Controllers/Api/. No DDD domain boundaries.
- scope: All backend code

## AD-2: Frontend is a static consumer
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: Next.js runs in SSG mode (output: 'export'). All data fetched at build time via fetch() to Laravel REST API. No database connections, no getServerSideProps.
- scope: FR-7, FR-8, FR-15

## AD-3: REST API is the contract
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: All responses follow { "data": ... } envelope for success, { "message": "...", "errors": {...} } for validation failures. Zod schemas in packages/shared mirror API shapes.
- scope: FR-15

## AD-4: Theme system uses CSS custom properties
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: Theme settings stored as key-value pairs in ThemeSetting model, exposed via GET /api/theme. Next.js writes CSS custom properties on :root at build time. Tailwind extends colors and fontFamily from var(--color-*) and var(--font-*). No component hardcodes brand colors.
- scope: FR-6, FR-7

## AD-5: Admin is the sole content authority
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: All content CRUD through REST API POST/PUT/DELETE endpoints. Public API is read-only (GET) except contact form and newsletter POST endpoints. Write endpoints require admin authentication via Laravel Sanctum tokens.
- scope: FR-1 through FR-6, FR-11, FR-12, FR-13, FR-14

## AD-6: Media is managed by Spatie Media Library
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: All file uploads go through Spatie Media Library. Files stored in storage/app/public/ with symlink at public/storage/. Each model defines its media collections. Deleting a model cascades to its media.
- scope: FR-4, FR-5, FR-6, FR-14

## AD-7: Content flow is unidirectional
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: Admin writes -> MySQL -> REST API -> Next.js build -> Static HTML. Content is 'ready' after save, 'live' after deploy. Admin panel does not trigger builds.
- scope: All FRs

## AD-8: Queued email with database-backed fallback
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: locked
- decision: Contact form submissions saved to contact_messages before email dispatch. Email runs through Laravel queue (database driver, no Redis). Failed deliveries retried up to 3 times.
- scope: FR-9

## D-9: Monorepo with npm workspaces
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: proposed
- decision: Single git repository with apps/backend (Laravel), apps/frontend (Next.js), packages/shared (Zod schemas). Root package.json defines npm workspaces. Apps never import from other apps; frontend -> shared is the only cross-package import.
- scope: project structure

## D-10: Admin panel in Next.js at /admin with shadcn/ui
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: proposed
- decision: Admin panel lives in Next.js frontend at /admin/* routes, built with shadcn/ui components. Admin visual identity: sidebar #1e1b2e, primary #FF0000, Inter typeface.
- scope: admin panel

## D-11: Font Awesome for public icons, Lucide for admin
- source: docs/project-context.md
- status: proposed
- decision: Font Awesome Free 6.x for all public site icons. Lucide React for all admin panel icons (shadcn default). Never mix families on the same surface. No emoji as UI icons.
- scope: iconography

## D-12: No client-side state management library
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- status: proposed
- decision: React Server Components with no client-side state management library (no Redux, Zustand, or similar). Client components only where browser APIs are required: ContactForm, NewsletterForm, mobile hamburger, BackToTop.
- scope: frontend state management

## D-13: Hostinger shared hosting deployment
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- status: proposed
- decision: Laravel runs on Hostinger Business Shared (PHP 8.2). Next.js frontend deploys as static HTML/JS/CSS at public_html/. Laravel at ~/laravel_app/ (outside public_html). No Node.js runtime on server. No Redis.
- scope: infrastructure

## D-14: Contact message management deferred to v1.1
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- status: proposed
- decision: FR-11 (Contact Message Management Admin) is explicitly deferred. Email notification covers the gap for v1. The data is in the DB.
- scope: FR-11

## D-15: Subscriber management deferred to v1.1
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- status: proposed
- decision: Subscriber management admin panel deferred to v1.1. Subscriber data is queryable directly from DB for v1.
- scope: subscriber management

## D-16: Default theme colors
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md
- status: proposed
- decision: Default theme: primary #ff0000, secondary #fb3d03, accent #FFC107, body_font Poppins, heading_font Poppins.
- scope: theme system
