# Architecture Overview

## Paradigm

**Flat MVC** — Laravel organizes by layer not domain. All models in `app/Models/`, controllers in `Http/Controllers/Api/`, resources in `Http/Resources/Api/`. No DDD. See [ARCHITECTURE-SPINE](./architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md) for full invariant definitions (AD-1 through AD-8).

## Project Layout

```
apps/
├── backend/          Laravel 12 REST API
│   ├── app/
│   │   ├── Models/             12 Eloquent models
│   │   ├── Http/Controllers/Api/  10 controllers
│   │   ├── Http/Resources/Api/     API resource classes
│   │   ├── Http/Requests/         FormRequest validation
│   │   └── Traits/ApiResponse.php  JSON response helper
│   ├── routes/api.php            All API endpoints
│   ├── database/migrations/      15 migration files
│   └── tests/                    PHPUnit feature tests
│
├── frontend/         Next.js 16 SSG
│   ├── app/          App Router — / (public) and /admin/
│   ├── components/   React components (ui/, admin/, public)
│   └── lib/          api.ts (public) + admin-api.ts (auth)
│
packages/
└── shared/           @amt/shared — Zod schemas for API contract
```

## Data Flow

```
Admin writes → MySQL → REST API → Next.js build → static HTML
```

1. Admin panel (Next.js) sends PUT/POST/DELETE via `auth:sanctum`
2. Laravel persists to MySQL via Eloquent
3. Public GET endpoints serve JSON with `{ "data": ... }` envelope
4. Next.js build fetches all data via `fetch()` at build time
5. Static HTML/CSS/JS exported to `out/`

## Key Architecture Decisions

| AD | Principle |
|----|-----------|
| AD-1 | Flat Laravel — no DDD |
| AD-2 | SSG only — no `getServerSideProps`, no DB from frontend |
| AD-3 | REST API contract — `{ "data": ... }` envelope |
| AD-4 | CSS custom properties — no hardcoded brand colors |
| AD-6 | Spatie Media Library for all uploads |
| AD-7 | Unidirectional content flow |

## API Structure

Public GET (no auth): `/api/services`, `/api/team`, `/api/pages`, `/api/blog-posts`, `/api/pricing-plans`, `/api/theme`

Public POST (rate-limited): `/api/contact`, `/api/subscribe`

Auth (Sanctum): POST `/api/admin/login`, then Bearer token for all admin CRUD at `/api/*`

## Models

12 models across 6 domains: Marketing (Service, TeamMember, Page, BlogPost), Billing (PricingPlan, PlanFeature), Contact (ContactMessage, Subscriber), Media (Media, MediaLibrary), Theme (ThemeSetting), Auth (User).

## Frontend Components

- **Public:** ServicesGrid, PricingTable, TeamGrid, BlogEditor, PageRenderer, Header, Footer
- **Admin:** Dashboard stats, CRUD tables/modals for each content type, Media library browser
- **UI:** shadcn primitives (button, card, table, input, label, alert-dialog)
