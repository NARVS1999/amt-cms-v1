# Development

## Project Structure

This is an npm workspaces monorepo. Commands run from the individual app directories (`apps/backend/`, `apps/frontend/`, `packages/shared/`).

## Backend (Laravel)

### Key Commands

```bash
php artisan serve            # Dev server on port 8000
php artisan test             # Run all tests
php artisan test --filter={TestName}  # Single test
php artisan migrate          # Run migrations
php artisan make:model ModelName  # Create model
php artisan make:controller Api/NameController  # Create API controller
```

### Architecture

- **Flat Laravel** — all models in `app/Models/`, controllers in `Http/Controllers/Api/`
- **Routes:** defined in `routes/api.php` — public GET, authenticated admin CRUD
- **Validation:** Laravel FormRequest classes
- **Auth:** Sanctorum token-based. Login at `POST /api/admin/login`
- **Media:** Spatie Media Library 11.x — upload through MediaController
- **Queue:** Database queue driver for email notifications

### Adding a New Resource

1. Migration (`database/migrations/`)
2. Model (`app/Models/`) with `HasFactory`, `$fillable`, `$casts`
3. Factory (`database/factories/Models/`)
4. API Resource (`app/Http/Resources/Api/`)
5. Controller with CRUD using `ApiResponse` trait
6. Routes: public GET outside `auth:sanctum`, admin CRUD inside
7. Feature tests

## Frontend (Next.js)

### Key Commands

```bash
npm run dev          # Dev server on port 3000
npm run build        # SSG build (output: 'export')
npx tsc --noEmit     # TypeScript check
npm run lint         # ESLint
```

### Key Conventions

- **SSG only** — `output: 'export'`, no `getServerSideProps`
- Data fetched at build time via `fetch()` from `lib/api.ts` (public) or `lib/admin-api.ts` (authenticated)
- Zod schemas from `@amt/shared` validate API responses
- Components in `components/` — `ui/` (shadcn), `admin/` (sidebar, stats), public (ServicesGrid, PricingTable, TeamGrid, etc.)
- Admin pages under `app/admin/` — each content type has a table + modal CRUD page
- Public pages under `app/(public)/`

### Adding an Admin Page

1. Create `interface XxxData` in `lib/admin-api.ts`
2. Add fetch/create/update/delete functions
3. Create page at `app/admin/{resource}/page.tsx`
4. Update `components/admin/sidebar.tsx`

## Shared Package

Zod schemas in `packages/shared/src/schemas/`. Mirrors API response shapes. Exported from `src/index.ts`. Used by frontend for build-time type validation.

## Code Style

- No raw SQL — Eloquent ORM only
- No hardcoded brand colors — use `var(--color-*)`
- Font Awesome for public site icons, Lucide for admin panel
- PascalCase components, camelCase functions
