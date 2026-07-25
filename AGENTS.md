# Adsvance Media Tech CMS — Agent Guide

## Critical rules

These MUST be followed for every implementation task:

| # | Rule | Reference |
|---|------|-----------|
| 1 | **No hardcoded brand colors** — use `var(--color-*)` or Tailwind `bg-primary`/`text-foreground` | AD-4 |
| 2 | **Eloquent ORM only** — no `DB::raw()`, `whereRaw()`, raw queries | NFR-16 |
| 3 | **SSG only** — no `getServerSideProps`, no API routes from Next.js, no DB from frontend. `output: 'export'`. | AD-2 |
| 4 | **Spatie Media Library** for all uploads — no `Storage::put()` | AD-6 |
| 5 | **API contract is the authority** — match `docs/SPEC.md` exactly when writing endpoints or frontend types | AD-3 |
| 6 | **Check `docs/ERROR-HANDLING.md`** before implementing any feature — known bugs, edge cases | — |
| 7 | **No emoji as UI icons** — Font Awesome (public) or Lucide (admin) | UX-DR15 |

## Key reference docs

| Document | Path | When to read |
|----------|------|-------------|
| Implementation SPEC | `docs/SPEC.md` | Every session — API shapes, DB columns, validation rules |
| Error Handling & Edge Cases | `docs/ERROR-HANDLING.md` | Before implementing any feature |
| Architecture Spine | `docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md` | AD-1 through AD-8 |
| UX Design Spec | `docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md` | Visual tokens, component specs |
| UX Experience Spine | `docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md` | Behavioral flows, accessibility, state patterns |
| Epics & Stories | `docs/epics.md` | Acceptance criteria for each user story |
| Project Context | `docs/project-context.md` | 84 detailed rules |
| SPEC addendum | `docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md` | Default theme colors and additional API details |
| Architecture overview | `docs/architecture/overview.md` | High-level system map |

## Architecture invariants

- **Flat Laravel** — all models in `app/Models/`, controllers in `Http/Controllers/Api/`, resources in `Http/Resources/Api/`. No DDD.
- **Frontend is static consumer** — SSG (`output: 'export'`). All data fetched at build time via `fetch()` to Laravel API.
- **API contract** — `{ "data": ... }` envelope. Admin CRUD via POST/PUT/DELETE behind `auth:sanctum`. Public GET is read-only except contact/subscribe.
- **CSS custom properties** — all visual tokens via `var(--color-*)`. No hardcoded brand colors.
- **Spatie Media Library** — all file uploads go through Spatie. No direct `Storage::put()`.
- **Unidirectional flow** — admin writes → MySQL → REST API → Next.js build → static HTML.

## API response pattern

- **Public GET endpoints** return raw `Resource::collection($items)` (NOT wrapped in `$this->success()`). No `data` envelope from the controller — Spatie Query Builder pagination includes its own structure.
- **Admin endpoints** (inside `auth:sanctum` group) and **single-resource responses** use `$this->success(new Resource($model))` from the `ApiResponse` trait.
- **Stats endpoint** (`GET /api/admin/stats`) returns a plain JSON object `{ services, blog_posts, unread_messages, subscribers }` — no `data` envelope.
- **Error responses:** `{ "message": "...", "errors": {...} }` for validation (422), `{ "message": "Not found." }` for 404.

## Key commands

```powershell
# Backend — Laravel
cd apps/backend; php artisan test                                      # full suite
cd apps/backend; php artisan test --filter=ServicesTest                 # single file
cd apps/backend; php artisan test --filter=test_returns_empty_data      # single test
cd apps/backend; php artisan serve                                     # dev server (port 8000)
cd apps/backend; ./vendor/bin/pint                                     # PHP CS fixer

# Frontend — Next.js
cd apps/frontend; npx tsc --noEmit                                     # typecheck only
cd apps/frontend; npm run build                                        # full SSG build → out/
cd apps/frontend; npm run dev                                          # dev server
cd apps/frontend; npm run lint                                         # ESLint (flat config v9+)
```

## Project structure

```
AMT_V2/
├── apps/
│   ├── backend/          Laravel 12 REST API (PHP 8.2)
│   └── frontend/         Next.js 16 SSG — shadcn admin + public site
├── packages/
│   └── shared/           @amt/shared — Zod schemas matching API
├── docs/                 PRDs, architecture, SPEC, UX specs
├── stories/              User stories + sprint tracking
└── .planning/            GSD planning artifacts (gsd-core workflow)
```

Root `npm` workspace includes `apps/backend` (Laravel Vite asset bundling — `package.json` for Vite build only), `apps/frontend`, and `packages/shared`. PHP dependencies via Composer in `apps/backend`.

## Testing quirks

- **Backend:** PHPUnit 11 with SQLite `:memory:` — migrations run per class via `RefreshDatabase` trait. 10 test classes in `tests/Feature/`. No unit tests in v1.
- **Frontend:** No test framework configured at all (no Vitest, Jest, or Playwright). Verify via `npx tsc --noEmit` + `npm run lint` + `npm run build`.
- Test database env vars set in `phpunit.xml` — `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`.
- Known implementation bugs documented in `docs/ERROR-HANDLING.md` — check before writing tests.

## Framework & toolchain quirks

- **Tailwind v4** — no `tailwind.config.*`. CSS-based config via `@theme` in `apps/frontend/app/globals.css`.
- **ESLint flat config** (`eslint.config.mjs`) — uses `eslint-config-next/core-web-vitals` + typescript presets.
- **Spatie Query Builder** — used for public listing endpoints (`->allowedSorts()`, `->allowedFilters()`, `->paginate()`).
- **Inline validation** in controllers (`$request->validate(...)`) — no separate FormRequest classes yet.
- **Database queue driver** (`QUEUE_CONNECTION=database`) — no Redis available on Hostinger shared hosting.
- **No CI/CD** — no `.github/` directory, no GitHub Actions.

## Naming conventions

| What | Convention | Example |
|------|-----------|---------|
| Models | Singular PascalCase | `PricingPlan`, `PlanFeature` |
| Tables | `{domain}_plural_snake_case` | `billing_pricing_plans`, `marketing_services` |
| Migrations | `{timestamp}_{action}_{table}` with domain prefix | `2026_07_21_000001_create_billing_pricing_plans_table` |
| API routes | kebab-case, plural | `GET /api/pricing-plans`, `POST /api/contact` |
| API Resources | `App\Http\Resources\Api\*` | `PricingPlanResource` |
| Factories | `Database\Factories\Models\*` | `PricingPlanFactory` (with `newFactory()` on model) |
| Frontend components | PascalCase | `ServicesGrid`, `PricingTable` |
| Admin pages | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| Admin API functions | camelCase in `lib/admin-api.ts` | `fetchPricingPlans()`, `createPricingPlan()` |

## Admin CRUD pattern (adding new resources)

1. Migration (two tables if 1:N, e.g. PricingPlan + PlanFeature) with domain prefix
2. Model with `HasFactory`, `$table`, `$fillable`, `$casts`, `newFactory()`
3. Factory in `Database\Factories\Models\` namespace
4. API Resource in `App\Http\Resources\Api\`
5. Controller with CRUD methods using `ApiResponse` trait; inline `$request->validate(...)`; eager-load with `->with()`
6. Routes: public GET outside `auth:sanctum`, POST/PUT/DELETE inside `auth:sanctum`
7. Admin page at `app/admin/{resource}/page.tsx` — table + modal form
8. `lib/admin-api.ts` — `interface XxxData` + `fetchXxx()` / `createXxx()` / `updateXxx()` / `deleteXxx()`
9. Update sidebar in `components/admin/sidebar.tsx`
10. Feature tests: test public GET (sorting, empty state, structure)

## Varied conventions

- Admin sidebar groups: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages, Subscribers — v1.1), Settings (Theme, Media, Pages)
- Font Awesome (`fa-brands`, `fa-solid`) for public site icons; Lucide for admin panel. Never mix.
- `border-t-2` for featured service accent; inline `style` for CSS var values (Tailwind v4 doesn't support dynamic `var()` in arbitrary values)
- `id` on API features is optional in frontend types (`id?: number`) since new records don't have one yet
- Frontend loads Google Fonts: Poppins (public site), Inter (admin) — defined in `app/layout.tsx`
- `packages/shared/` Zod schemas should mirror API resource shapes exactly — check before and after API changes
- `safeCount()` helper in `StatsController` wraps Eloquent count in try/catch — returns 0 for tables that don't exist yet

## Sketch findings

Design decisions, CSS patterns, and visual direction: `Skill("sketch-findings-amt-v2")`
