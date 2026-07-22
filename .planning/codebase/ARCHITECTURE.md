# Architecture

## System Overview

Adsvance Media Tech CMS follows a **unidirectional content flow** pattern:

```
Admin (Next.js SSG) ──POST/PUT/DELETE──→ Laravel API ──→ MySQL
                                                          │
Public (Next.js SSG) ───────GET (build time)──────────────┘
                                                          │
                                              Static HTML ──→ Deploy
```

**Key principle:** Content is "ready" after save, "live" only after the Next.js SSG rebuild and deploy. The frontend has zero server-side rendering — everything is generated at build time.

## Architectural Invariants (AD-1 through AD-8)

1. **Flat Laravel** — all models in `app/Models/`, controllers in `Http/Controllers/Api/`, resources in `Http/Resources/Api/`. No DDD.
2. **Frontend is static consumer** — SSG (`output: 'export'`). All data fetched at build time via `fetch()`. No `getServerSideProps`, no DB access.
3. **API contract** — `{ "data": ... }` envelope. Admin CRUD via POST/PUT/DELETE behind `auth:sanctum`. Public GET is read-only except contact/subscribe.
4. **CSS custom properties** — all visual tokens via `var(--color-*)`. No hardcoded brand colors.
5. **Spatie Media Library** — all file uploads through Spatie. No direct `Storage::put()`.
6. **Unidirectional flow** — admin writes → MySQL → REST API → Next.js build → static HTML.

## Backend Architecture

### Layered Structure

```
routes/api.php ──→ Controllers ──→ Models ──→ Database
                      │
                      └──→ Resources ──→ JSON response
```

- **Routes** (`routes/api.php`): All API routes defined in a single file. Public GET routes are outside any middleware group. Admin CRUD routes are inside `auth:sanctum` middleware group.
- **Controllers** (`app/Http/Controllers/Api/`): Slim controllers that validate requests, delegate to Eloquent, and return resources via the `ApiResponse` trait.
- **Models** (`app/Models/`): Eloquent models with `HasFactory`, `$fillable`, `$casts`. 1:N relations (e.g., `PricingPlan` → `PlanFeature`).
- **Resources** (`app/Http/Resources/Api/`): Transform Eloquent models to JSON. Use `whenLoaded()` for conditional relationship loading.
- **Trait** (`app/Traits/ApiResponse.php`): `success()` and `error()` methods wrapping the `{ "data": ... }` envelope.

### API Response Envelope

```json
{
  "data": { ... }
}
```

Error responses omit the `data` key:
```json
{
  "message": "...",
  "errors": { ... }
}
```

### Auth Flow

1. Admin POSTs credentials to `/api/admin/login`
2. Sanctum issues a plaintext token
3. Token stored in `localStorage` as `admin_token`
4. All admin requests include `Authorization: Bearer {token}`
5. 401 responses clear the token client-side

### Public GET Endpoints

| Endpoint | Controller | Description |
|----------|-----------|-------------|
| `GET /api/pages` | `PageController@index` | Published pages |
| `GET /api/pages/{slug}` | `PageController@show` | Single page by slug |
| `GET /api/services` | `ServiceController@index` | All services, sorted |
| `GET /api/team` | `TeamMemberController@index` | Team members, sorted |
| `GET /api/blog-posts` | `BlogPostController@index` | Published posts |
| `GET /api/blog-posts/{slug}` | `BlogPostController@show` | Single post by slug |
| `GET /api/pricing-plans` | `PricingPlanController@index` | Published plans with features |
| `GET /api/theme` | `ThemeController@index` | Active theme settings |

### POST Endpoints (Public)

| Endpoint | Middleware | Description |
|----------|-----------|-------------|
| `POST /api/contact` | `throttle:contact` | Contact form submission |
| `POST /api/subscribe` | `throttle:subscribe` | Newsletter subscription |

### Admin CRUD (auth:sanctum)

| Resource | POST | PUT | DELETE | GET (list) |
|----------|------|-----|--------|------------|
| Services | `/api/services` | `/api/services/{id}` | `/api/services/{id}` | — |
| Team | `/api/team` | `/api/team/{id}` | `/api/team/{id}` | — |
| Pages | `/api/pages` | `/api/pages/{id}` | `/api/pages/{id}` | `/api/admin/pages` |
| Pricing Plans | `/api/pricing-plans` | `/api/pricing-plans/{id}` | `/api/pricing-plans/{id}` | — |
| Blog Posts | `/api/blog-posts` | `/api/blog-posts/{id}` | `/api/blog-posts/{id}` | — |
| Media | `/api/media` | — | `/api/media/{id}` | `/api/media` |

## Frontend Architecture

### Page Structure

```
layout.tsx (root layout)
├── app/(public)/        — Public pages (SSG)
│   ├── layout.tsx
│   ├── page.tsx         — Home page
│   └── not-found.tsx
├── app/admin/           — Admin panel (client-side auth)
│   ├── layout.tsx
│   ├── page.tsx         — Dashboard
│   ├── login/
│   ├── dashboard/
│   ├── services/
│   ├── team/
│   ├── pages/
│   ├── pricing-plans/
│   ├── blog-posts/
│   └── media/
```

### Component Structure

```
components/
├── admin/
│   ├── sidebar.tsx
│   └── stats-overview.tsx
├── ui/                  — shadcn-style primitives
├── Header.tsx
├── Footer.tsx
├── ServicesGrid.tsx
├── TeamGrid.tsx
├── PricingTable.tsx
├── BlogEditor.tsx
├── PageRenderer.tsx
├── ThemeProvider.tsx
└── BackToTop.tsx
```

### Data Flow

- **Public pages** (`lib/api.ts`): Fetch at build time with Zod schema validation. Graceful fallback to empty arrays on error.
- **Admin pages** (`lib/admin-api.ts`): Token-authenticated fetch. All CRUD functions return typed responses. 401 triggers auto-logout.
- **Shared schemas** (`packages/shared/src/schemas/`): Zod schemas defining API response shapes for 8 entities.

## Database Schema

### Tables (15 migrations)

| Table | Prefix | Purpose |
|-------|--------|---------|
| `users` | — | Admin users |
| `personal_access_tokens` | — | Sanctum tokens |
| `media` | — | Spatie media items |
| `contact_messages` | `contact_` | Contact form submissions |
| `subscribers` | `contact_` | Newsletter subscribers |
| `services` | `marketing_` | Marketing services |
| `team_members` | `marketing_` | Team profiles |
| `theme_settings` | — | Site theme configuration |
| `pages` | `marketing_` | CMS pages |
| `media_libraries` | `media_` | Media library entries |
| `pricing_plans` | `billing_` | Pricing plans |
| `plan_features` | `billing_` | Plan features (1:N) |
| `blog_posts` | `marketing_` | Blog posts |
