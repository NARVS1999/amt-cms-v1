# Adsvance Media Tech CMS — Agent Guide

## Project structure

```
├── apps/
│   ├── backend/       Laravel 12 (REST API only)
│   └── frontend/      Next.js 16 SSG (public site + shadcn admin panel)
├── packages/
│   └── shared/        @amt/shared — Zod schemas mirroring API responses
├── stories/           Story files for incremental dev
└── docs/              PRDs, architecture, UX docs
```

npm workspaces root. Run commands from `apps/backend/` or `apps/frontend/`.

## Key commands

```powershell
# Backend — Laravel
cd apps/backend; php artisan test                                   # full suite
cd apps/backend; php artisan test --filter=ServicesTest              # single file
cd apps/backend; php artisan test --filter=test_returns_empty_data   # single test
cd apps/backend; php artisan serve                                  # dev server (port 8000)

# Frontend — Next.js
cd apps/frontend; npx tsc --noEmit                                  # typecheck only
cd apps/frontend; npm run build                                     # full SSG build
cd apps/frontend; npm run dev                                       # dev server
cd apps/frontend; npm run lint                                      # ESLint
```

## Architecture invariants (AD-1 through AD-8)

- **Flat Laravel** — all models in `app/Models/`, controllers in `Http/Controllers/Api/`, resources in `Http/Resources/Api/`. No DDD.
- **Frontend is static consumer** — SSG (`output: 'export'`). All data fetched at build time via `fetch()` to Laravel API. No `getServerSideProps`, no DB access from frontend.
- **API contract** — `{ "data": ... }` envelope. Admin CRUD via POST/PUT/DELETE behind `auth:sanctum`. Public GET is read-only except contact/subscribe.
- **CSS custom properties** — all visual tokens via `var(--color-*)`. No hardcoded brand colors.
- **Spatie Media Library** — all file uploads go through Spatie. No direct `Storage::put()`.
- **Unidirectional flow** — admin writes → MySQL → REST API → Next.js build → static HTML. Content is "ready" after save, "live" after deploy.

## Naming conventions

| What | Convention | Example |
|------|-----------|---------|
| Models | Singular PascalCase | `PricingPlan`, `PlanFeature` |
| Tables | Plural snake_case with prefix | `billing_pricing_plans`, `marketing_services` |
| Migrations | `{timestamp}_{action}_{table}` | `2026_07_21_000001_create_billing_pricing_plans_table` |
| API routes | kebab-case, plural | `GET /api/pricing-plans`, `POST /api/contact` |
| API Resources | App\Http\Resources\Api\* | `PricingPlanResource` |
| Factories | Database\Factories\Models\* | `PricingPlanFactory` (namespace `Database\Factories\Models`) |
| Frontend components | PascalCase | `ServicesGrid`, `PricingTable` |
| Admin pages | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| Admin API functions | camelCase in `lib/admin-api.ts` | `fetchPricingPlans()`, `createPricingPlan()` |

## Admin CRUD pattern (for adding new resources)

1. Migration (two tables if 1:N relation, e.g. PricingPlan + PlanFeature)
2. Model with `HasFactory`, `$table`, `$fillable`, `$casts`, `newFactory()`
3. Factory in `Database\Factories\Models\` namespace
4. API Resource in `App\Http\Resources\Api\`
5. Controller with CRUD methods using `ApiResponse` trait; eager-load relationships with `->with()`
6. Routes: public GET outside `auth:sanctum`, POST/PUT/DELETE inside `auth:sanctum`
7. Admin page at `app/admin/{resource}/page.tsx` — table + modal form
8. `lib/admin-api.ts` — `interface XxxData` + fetch/create/update/delete functions
9. Update sidebar in `components/admin/sidebar.tsx`
10. Feature tests: test public GET only (sorting, empty state, structure)

## Stats endpoint note

`GET /api/admin/stats` returns `blog_posts: 0` hardcoded until BlogPost model exists. The `safeCount()` helper wraps queries in try/catch for tables that don't exist yet.

## Varied conventions to note

- Admin sidebar groups: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages, Subscribers — v1.1), Settings (Theme, Media, Pages)
- Font Awesome (`fa-brands`, `fa-solid`) for public site icons; Lucide for admin panel
- `border-t-2` for featured service accent; inline `style` for CSS var values (Tailwind v4 doesn't support dynamic `var()` in arbitrary values)
- `phpunit.xml` uses SQLite `:memory:` for tests — migrations run automatically per test class via `RefreshDatabase` trait
- `id` on API features is optional in frontend types (`id?: number`) since new records don't have one yet

## Story workflow

- Story files under `stories/` with status: `backlog → ready-for-dev → in-progress → review → done`
- Sprint status in `stories/sprint-status.yaml`

## What NOT to do

- No raw SQL — Eloquent ORM only (NFR-16)
- No PWA, no offline mode, no dark mode toggle (v1 scope)
- No emoji as UI icons (UX-DR15)
- No hardcoded brand colors — use `var(--color-*)` (AD-4)
- No `getServerSideProps` — SSG only (AD-2)
- No direct file storage — Spatie only for uploads (AD-6)
