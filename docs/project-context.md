---
project_name: 'Adsvance Media Tech CMS'
user_name: 'Admin'
date: '2026-07-18'
sections_completed:
  - technology_stack
  - language-specific-rules
  - framework-specific-rules
  - testing-rules
  - code-quality-style-rules
  - development-workflow-rules
  - critical-dont-miss-rules
existing_patterns_found: 10
status: complete
rule_count: 84
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Backend (apps/backend)
| Technology | Version | Constraint |
|-----------|---------|-----------|
| PHP | 8.2.12 | Hostinger Business Shared compatible |
| Laravel | 12.x | Current LTS (security until Feb 2027) |
| MariaDB (dev) | 10.4 | Via XAMPP |
| MySQL (prod) | 8.x | Via Hostinger |
| Spatie Media Library | 11.x | All file uploads must go through this |
| HTMLPurifier | 4.x | Sanitize all rich text before public render |

### Frontend (apps/frontend)
| Technology | Version | Constraint |
|-----------|---------|-----------|
| Node.js | 20.17.0 | ✅ Installed locally |
| Next.js | 16.2.10 | SSG via `output: 'export'` — no Node runtime on server |
| React | 19.x | Bundled with Next.js 16 |
| shadcn/ui | latest | Admin panel components via CLI `npx shadcn@latest add` |
| Tailwind CSS | 4.x | CSS-first config (not v3 config format) |
| TypeScript | 5.x | Frontend only; backend is PHP |
| Quill.js | 2.x | Rich text editor for blog posts |
| Font Awesome Free | 6.x | All public site icons |
| Zod | 3.x | Schema validation in `packages/shared` |

### Version Change Warnings
- **Laravel 11 → 12**: 11's security support ended March 2026. Pin to 12.x.
- **Next.js 14 → 16.2.10**: 14's security support ended Oct 2025. Static export fully supported in v16.
- All packages must be **free/open-source** — no paid APIs (NFR-10).

## Critical Implementation Rules

### Language-Specific Rules

#### PHP (Backend — Laravel)
- **No raw SQL anywhere.** All queries through Eloquent ORM — no `DB::raw()`, no raw `whereRaw()`, no raw selects. SQL injection must be impossible by design (NFR-6, AD-7).
- **All API input validation in Laravel FormRequest classes.** Never validate inline in controllers.
- **Flat Laravel structure** — models in `app/Models/`, controllers in `app/Http/Controllers/Api/`.
- **Migration naming:** `YYYY_MM_DD_HHMMSS_create_{table}_table.php`
- **Environment-driven config only.** No hardcoded URLs, emails, or credentials — everything in `.env`.

#### TypeScript (Frontend — Next.js + Shared)
- **Strict mode enabled** in `tsconfig.json`. No `any` types — API responses typed via Zod schemas from `packages/shared`.
- **React Server Components (RSC) by default.** Client components (`'use client'`) only where browser APIs are required: `ContactForm`, `NewsletterForm`, mobile hamburger toggle, `BackToTop` scroll detector.
- **No client-side state management library.** No Redux, Zustand, or similar. Local component state or React hooks for form state.
- **Tailwind CSS v4 uses CSS-first config** — extend via `@theme` in CSS, not a `tailwind.config.js` object.

### Framework-Specific Rules

#### Laravel 12 (Backend Framework)
- **Flat Laravel structure:** Models in `app/Models/`, API controllers in `app/Http/Controllers/Api/`. No domain directories.
- **API response caching** on `GET /api/*` endpoints — target <200ms response time. Use Laravel's built-in caching where appropriate.
- **Rate limiting** via `RateLimiter` facade on API route level, database-backed (no Redis): Contact=5/min/IP, Newsletter=3/min/IP.
- **CORS** restricted to deployed frontend domain in production. Configure via `config/cors.php`.

#### Admin Panel (Next.js/shadcn)
- Admin panel lives in the Next.js frontend at `/admin/*` routes, built with shadcn/ui components.
- All admin forms, tables, and dashboards use shadcn/ui primitives with a consistent design system.
- Admin visual identity locked: Sidebar `#1e1b2e`, primary `#FF0000`, Inter typeface. No customization of components beyond DESIGN.md specs.

#### Next.js 16 (SSG Frontend)
- **`output: 'export'`** in `next.config.ts` — all pages pre-built to static HTML. No Node.js runtime on server.
- **No `getServerSideProps`** or database connections from frontend. Data fetched at build time via `fetch()` to Laravel REST API.
- **Dynamic routes** (`/blog/[slug]`) use `generateStaticParams` to pre-build all published post pages.
- **`ThemeProvider`** fetches `GET /api/theme` at build time and writes CSS custom properties into `:root` — no runtime theme switching.
- **404 page** at `app/not-found.tsx` handles catch-all unknown routes. Blog 404 at component level for unknown slugs.

### Testing Rules

#### Backend (Pest / PHPUnit)
- **Feature tests for all API endpoints.** Every `GET /api/*` must test: HTTP 200 with `{ "data": ... }`, correct sort order, 404 on nonexistent resources.
- **POST endpoint coverage:** Test HTTP 201 (success), HTTP 422 (validation failure), HTTP 429 (rate limit). Contact form tests must verify `read_at: null` on creation.
- **Rate limit tests:** Contact = 5/min/IP, Subscribe = 3/min/IP. Test boundary (4 succeeds, 6th fails for contact).
- **Media upload tests:** Verify 2MB max, JPG/PNG/WebP/SVG acceptance, other formats rejected.
- **CORS tests:** Verify production CORS rejects non-deployed origins.
- **Migration tests:** Run `php artisan migrate:fresh --seed` — verify all 10 tables created and seed data loads.

#### Frontend (Vitest / React Testing Library)
- **Component tests for interactive components:** `ContactForm` (idle/success/error/rate-limited states), `NewsletterForm`, mobile hamburger (aria-expanded, focus trap), `BackToTop` (hidden until 300px).
- **Accessibility assertions** on every interactive component: skip-to-content link, `aria-describedby` on errors, `aria-live` on status, `aria-expanded` on hamburger.
- **API client tests:** Mock Laravel API, verify Zod schema validation catches mismatched API shapes.
- **No snapshot tests for static/SSG content** — pre-built pages are tested by the build process, not unit tests.

### Code Quality & Style Rules

#### Naming Conventions
- **Models:** Singular PascalCase — `Service`, `PricingPlan`, `BlogPost`, `ContactMessage`, `Subscriber`, `ThemeSetting`
- **Database tables:** `{entity}` plural snake_case — `services`, `pricing_plans`, `contact_messages`, `theme_settings`
- **API routes:** kebab-case multi-word — `/api/pricing-plans`, `/api/blog-posts`, `/api/team`
- **Migrations:** `YYYY_MM_DD_HHMMSS_{action}_{table}` — `create_services_table`, `add_sort_order_to_services_table`
- **Frontend components:** PascalCase — `ServiceCard`, `PricingTable`, `BlogCard`, `ThemeProvider`, `ContactForm`
- **Frontend pages:** kebab-case directories under `app/` — `app/blog/[slug]/page.tsx`
- **API controllers:** `{Entity}Controller` — `ServiceController`, `PricingPlanController`, `ThemeController`

#### Code Organization
- **Monorepo boundaries:** `apps/backend`, `apps/frontend`, `packages/shared`. Apps never import from other apps. `apps/frontend` → `packages/shared` is the only cross-package import allowed.
- **Backend Controllers in API namespace:** `App\Http\Controllers\Api\*`, not default controller directory.
- **`packages/shared`** contains only TypeScript Zod schemas exported from `src/index.ts`. No PHP code.

#### Styling & UI Guardrails
- **Icons:** Font Awesome Free 6.x for public site. Lucide for admin (shadcn default). Never mix families on the same surface.
- **No emoji as UI icons** anywhere in production (UX-DR15).
- **No celebration animations, confetti, or exclamation marks in admin microcopy.** Admin is a tool, not a cheerleader.
- **Public site voice:** Warm, conversational. Uses "you" and "we." No jargon.
- **Admin microcopy:** Neutral, direct. "Saved." / "Couldn't save. Try again." / "Delete this post? This can't be undone."
- **No hardcoded brand colors** in any component. All visual tokens resolve through `var(--color-*)` CSS custom properties (AD-4).

### Development Workflow Rules

#### Build Pipeline
- **Frontend build:** `cd apps/frontend && npm run build` → produces `apps/frontend/out/` static export. Upload contents to Hostinger `public_html/`.
- **Backend deploy:** Upload `apps/backend` (excluding `node_modules`, `.git`, `storage/debug`) to Hostinger `~/laravel_app/`. Run `php artisan migrate --seed`.
- **Content lifecycle:** Admin saves → data is *ready* in MySQL. Full rebuild + deploy → content is *live*. Admin never triggers builds (AD-7).
- **No CI/CD in v1** — manual build + FTP. CI (GitHub Actions) can be added post-launch.

#### Environment Configuration
- **Local setup:** XAMPP MariaDB 10.4 at localhost:3306. Backend at `php artisan serve` (port 8000). Frontend at `npm run dev` (port 3000).
- **Backend `.env` must configure:** `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_URL`, `CONTACT_NOTIFICATION_EMAIL`, `MAIL_*`.
- **Frontend `.env.local` must set:** `NEXT_PUBLIC_API_URL=http://localhost:8000/api` (dev) or production URL.
- **No hardcoded configuration** in code — everything environment-driven (NFR-9).

#### Security Rules
- **Admin panel:** HTTPS only in production. `config/cors.php` restricts to deployed frontend domain.
- **All rich text** (blog post content) sanitized via HTMLPurifier before rendering on the public site (NFR-4).
- **No raw SQL queries** in v1 codebase — Eloquent ORM only (NFR-16).
- **Admin passwords** hashed via Laravel's default bcrypt (NFR-6).

### Critical Don't-Miss Rules

#### Architecture Invariants (NEVER BREAK)
- ❌ **Never hardcode brand colors** in any component. All visual tokens resolve through `var(--color-*)` CSS custom properties. A component with `#FF0000` literal is wrong (AD-4).
- ❌ **Never add server-rendered pages.** No `getServerSideProps`, no Next.js API routes, no database connections from the frontend. SSG only (`output: 'export'`) (AD-2).
- ❌ **Never write raw SQL.** Eloquent ORM only. No `DB::raw()`, no `whereRaw()`, no raw selects (NFR-16).

#### Content Model Gotchas
- ⚠️ **Only one "Most Popular" pricing plan.** Toggling `is_popular` on a plan must remove it from any other plan.
- ⚠️ **Blog slugs** auto-generate from title but must be admin-overridable. Unique constraint in DB.
- ⚠️ **Published filtering at query level.** `is_published = false` means the record is excluded from ALL public API responses — not just hidden in UI.
- ⚠️ **Contact message `read_at`** defaults to `null`. Message management admin UI deferred to v1.1 — data is queryable in DB only for v1.
- ⚠️ **Price field** is `decimal(10,2)` — validate numeric input on save. Display as `₱XXX` formatted string in frontend.
- ⚠️ **Sort order** managed via admin panel. Column `sort_order` (integer, default 0) on all ordered models.

#### Infrastructure Constraints
- ⚠️ **Hostinger shared hosting** — no Node.js runtime. Frontend is flat static files only.
- ⚠️ **Laravel lives outside `public_html`** at `~/laravel_app/`. Frontend static files go in `~/public_html/`. `.htaccess` rewrites `/api/*` to Laravel.
- ⚠️ **No Redis** — database-backed queue driver for emails. Database-backed rate limiting. No Redis dependency in v1.
- ⚠️ **Zero-cost software mandate** — all packages free/open-source. No paid APIs, no SaaS subscriptions (NFR-10).

#### Accessibility Must-Haves (WCAG 2.2 AA)
- ♿ **Skip-to-content link:** First focusable element on every public page, visible on focus.
- ♿ **Form labels:** Visible `<label>` elements required — placeholders must NOT serve as labels.
- ♿ **Form errors:** Each error message linked via `aria-describedby` on the input element.
- ♿ **Status announcements:** Success/error messages use `aria-live="polite"` region.
- ♿ **Mobile hamburger nav:** `aria-expanded` (true/false), `role="dialog"`, `aria-modal="true"`, focus trap inside drawer.
- ♿ **Pricing "Most Popular":** Announced via `aria-label` on the card for screen readers.
- ♿ **Color pickers:** Hex text input serves as accessible alternative to visual swatch — both labeled.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — they encode architecture invariants and business constraints
- When in doubt, prefer the more restrictive option (e.g., another Eloquent query over raw SQL)
- Update this file if new patterns emerge that should be preserved

**For Humans (Project Maintainers):**
- Keep this file lean — focus on unobvious details that AI agents are likely to miss
- Update when technology stack or framework versions change
- Review quarterly to remove rules that have become obvious or obsolete
- Remove rules once they become standard practice for agents working on this project

*Last Updated: 2026-07-18*
