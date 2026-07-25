# AMT_V2 Architecture

## System Overview

Adsvance Media Tech CMS is a **decoupled content management system** with strict **unidirectional data flow**:

```
Admin writes → Laravel REST API → MySQL → Next.js SSG build → Static HTML
```

The key architectural principle: content is **"ready" after save**, **"live" after deploy**. The frontend is purely static — every page is pre-rendered at build time by fetching from the Laravel API. There is no server-side rendering, no database access from the frontend, and no dynamic API routes in Next.js.

---

## Architectural Invariants (AD-1 through AD-8)

| # | Rule | Rationale |
|---|------|-----------|
| AD-1 | Flat Laravel structure — models in `app/Models/`, controllers in `Http/Controllers/Api/`, resources in `Http/Resources/Api/`. No DDD. | Simplicity, discoverability |
| AD-2 | Frontend is static consumer — SSG (`output: 'export'`). All data fetched at build time via `fetch()`. No `getServerSideProps`, no DB access from frontend. | Decoupled architecture |
| AD-3 | API contract is the authority — `{ "data": ... }` envelope. Public GET is read-only. Admin CRUD via POST/PUT/DELETE behind `auth:sanctum`. | Contract-first development |
| AD-4 | CSS custom properties — all visual tokens via `var(--color-*)`. No hardcoded brand colors. | Theming flexibility |
| AD-5 | Spatie Media Library for all uploads — no `Storage::put()` anywhere. | Consistent file handling |
| AD-6 | Unidirectional flow — admin writes → MySQL → REST API → Next.js build → static HTML. | Content lifecycle clarity |
| AD-7 | No raw SQL — Eloquent ORM only. `DB::raw()`, `whereRaw()`, raw selects prohibited. | SQL injection prevention |
| AD-8 | Check `docs/SPEC.md` and `docs/ERROR-HANDLING.md` before implementing any feature. | Prevents contract/edge-case bugs |

---

## Backend Architecture

### Stack
- **Laravel 12** (REST API only)
- **MySQL** (production) / **SQLite**:memory: (tests)
- **Laravel Sanctum** for admin token auth
- **Spatie Media Library** for file uploads
- **Spatie Query Builder** for sorting/filtering

### Route Structure

All routes defined in `apps/backend/routes/api.php` under a single `Route::prefix('api')` group (via `RouteServiceProvider`). Structure:

```
Group          | Middleware          | Endpoints
---------------|--------------------|----------------------------------------------
Public GET     | none                | /pages, /pages/{slug}, /services, /team,
               |                    | /blog-posts, /blog-posts/{slug},
               |                    | /pricing-plans, /theme
Public POST    | throttle:contact   | /contact
               | throttle:subscribe | /subscribe
Auth (anon)    | throttle:admin-login | /admin/login
               | throttle:3,1       | /forgot-password
               | none                | /reset-password
Auth (signed)  | auth:sanctum       | /me, /logout, /admin/pages,
               |                    | /services CRUD, /team CRUD,
               |                    | /pages CRUD, /pricing-plans CRUD,
               |                    | /blog-posts CRUD, /admin/stats,
               |                    | /media CRUD
Fallback       | none               | 404 JSON for unknown API routes
```

### Controller Pattern

All controllers live in `App\Http\Controllers\Api\` (plus `Api\Admin\` for the StatsController). Each controller:

1. **Uses `ApiResponse` trait** for `$this->success()` and `$this->error()` helpers
2. **Public `index()`** uses `Spatie\QueryBuilder\QueryBuilder` for sorting/filtering/pagination
3. **Public `show()`** returns single resource or 404 error response
4. **Admin methods** (`store`, `update`, `destroy`) validate with `$request->validate()`, use Eloquent for CRUD, return `$this->success()`
5. **Eager-loads relationships** with `->with()` (e.g., PricingPlanController loads `features`)

Controllers list:
- `AdminAuthController` — login, me, logout
- `BlogPostController` — index, show, store, update, destroy
- `ContactController` — store (with FormRequest validation)
- `ForgotPasswordController` — sendResetLink
- `MediaController` — index, store, destroy
- `PageController` — index, adminIndex, show, store, update, destroy
- `PricingPlanController` — index, adminIndex, store, update, destroy
- `ResetPasswordController` — reset
- `ServiceController` — index, store, update, destroy
- `SubscribeController` — store (with FormRequest validation)
- `TeamMemberController` — index, store, update, destroy
- `ThemeController` — index
- `Admin\StatsController` — index (dashboard stats with safeCount helper)

### Models

All models in `App\Models`. Flat structure (no subdirectories).

| Model | Table | Traits | Key Relationships |
|-------|-------|--------|-------------------|
| `User` | `users` | `HasApiTokens`, `HasFactory`, `Notifiable` | — |
| `Service` | `marketing_services` | `HasFactory` | — |
| `TeamMember` | `marketing_team_members` | `HasFactory`, `InteractsWithMedia` | media (Spatie) |
| `Page` | `marketing_pages` | `HasFactory` | — |
| `PricingPlan` | `billing_pricing_plans` | `HasFactory` | `features()` (HasMany) |
| `PlanFeature` | `billing_plan_features` | `HasFactory` | `plan()` (BelongsTo) |
| `BlogPost` | `marketing_blog_posts` | `HasFactory`, `InteractsWithMedia` | media (Spatie) |
| `ThemeSetting` | `theme_settings` | — | — |
| `ContactMessage` | `contact_contact_messages` | — | — |
| `Subscriber` | `contact_subscribers` | — | — |
| `Media` | `media` | Extends Spatie `BaseMedia` | — |
| `MediaLibrary` | `media_libraries` | `InteractsWithMedia` | — |

**Common patterns** across models:
- Explicit `$table` property matching migration table name
- `$fillable` for mass assignment
- `$casts` for type coercion (boolean, array, datetime, decimal, integer)
- `HasFactory` + `newFactory()` static method for factories in `Database\Factories\Models\`
- Spatie `HasMedia`/`InteractsWithMedia` on TeamMember, BlogPost, MediaLibrary

### API Resources

All in `App\Http\Resources\Api\` — extend `JsonResource` and transform models to JSON arrays.

| Resource | Models | Notes |
|----------|--------|-------|
| `ServiceResource` | Service | Direct field mapping |
| `TeamMemberResource` | TeamMember | Includes `photo_url` via Spatie |
| `PageResource` | Page | Includes `sections` JSON array |
| `BlogPostResource` | BlogPost | Conditionally includes `content` on `show()`, `featured_image_url` via Spatie |
| `PricingPlanResource` | PricingPlan | Includes nested `features` when loaded |
| `ApiResource` | Generic | Base class that does NOT double-wrap (envelope is at controller level) |

### API Response Envelope

**Success:**
```json
{
  "data": { ... }
}
```
For paginated collections, Laravel automatically appends:
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

**Error:**
```json
{
  "message": "Not found.",
  "errors": { "field": ["Validation error"] }
}
```

The `ApiResponse` trait provides:
- `success(mixed $data, int $code = 200): JsonResponse` — wraps in `{ "data": ... }`
- `error(string $message, int $code = 400, array $errors = []): JsonResponse` — plain message, optional errors

### Validation

Controllers use inline `$request->validate()` for most endpoints. Two endpoints use FormRequest classes: `ContactRequest` and `SubscribeRequest` (in `app/Http/Requests/`).

---

## Auth Flow

### Authentication Mechanism
Laravel Sanctum token-based authentication.

### Login Flow
1. `POST /api/admin/login` with `{ email, password, remember? }`
2. Server validates credentials against `users` table (bcrypt)
3. On success: creates a Sanctum token with configurable expiry
   - `remember: true` → 30 days
   - `remember: false` → 24 hours
4. Returns `{ data: { token: "1|abc123...", user: { id, name, email } } }`
5. Frontend stores token in `localStorage` as `admin_token`
6. All subsequent admin requests include `Authorization: Bearer <token>` header

### Token Management
- `GET /api/me` — returns current user info
- `POST /api/logout` — deletes current access token
- 401 responses trigger `clearToken()` + redirect to login on the frontend

### Password Reset
- `POST /api/forgot-password` (throttled: 3/1min) — sends reset link, returns token in non-production
- `POST /api/reset-password` — validates token + password + confirmation

---

## API Endpoints

### Public GET (no auth)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/api/pages` | `PageController@index` | List published pages (paginated) |
| GET | `/api/pages/{slug}` | `PageController@show` | Single published page by slug |
| GET | `/api/services` | `ServiceController@index` | List services (paginated, sortable) |
| GET | `/api/team` | `TeamMemberController@index` | List team members (paginated) |
| GET | `/api/blog-posts` | `BlogPostController@index` | List blog posts (paginated, sortable) |
| GET | `/api/blog-posts/{slug}` | `BlogPostController@show` | Single blog post by slug |
| GET | `/api/pricing-plans` | `PricingPlanController@index` | List published plans with features |
| GET | `/api/theme` | `ThemeController@index` | Current theme settings |

### Public POST (throttled)

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|------------|------------|-------------|
| POST | `/api/contact` | `ContactController@store` | `throttle:contact` | Submit contact form |
| POST | `/api/subscribe` | `SubscribeController@store` | `throttle:subscribe` | Newsletter subscription |

### Auth (no token required, throttled)

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|------------|------------|-------------|
| POST | `/api/admin/login` | `AdminAuthController@login` | `throttle:admin-login` | Admin login |
| POST | `/api/forgot-password` | `ForgotPasswordController@sendResetLink` | `throttle:3,1` | Request password reset |
| POST | `/api/reset-password` | `ResetPasswordController@reset` | none | Execute password reset |

### Admin CRUD (auth:sanctum)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/api/me` | `AdminAuthController@me` | Current user info |
| POST | `/api/logout` | `AdminAuthController@logout` | Logout |
| GET | `/api/admin/pages` | `PageController@adminIndex` | All pages (incl. drafts) |
| POST | `/api/services` | `ServiceController@store` | Create service |
| PUT | `/api/services/{service}` | `ServiceController@update` | Update service |
| DELETE | `/api/services/{service}` | `ServiceController@destroy` | Delete service |
| POST | `/api/team` | `TeamMemberController@store` | Create team member |
| PUT | `/api/team/{teamMember}` | `TeamMemberController@update` | Update team member |
| DELETE | `/api/team/{teamMember}` | `TeamMemberController@destroy` | Delete team member |
| POST | `/api/pages` | `PageController@store` | Create page |
| PUT | `/api/pages/{page}` | `PageController@update` | Update page |
| DELETE | `/api/pages/{page}` | `PageController@destroy` | Delete page |
| POST | `/api/pricing-plans` | `PricingPlanController@store` | Create plan (with features) |
| PUT | `/api/pricing-plans/{pricingPlan}` | `PricingPlanController@update` | Update plan (with features) |
| DELETE | `/api/pricing-plans/{pricingPlan}` | `PricingPlanController@destroy` | Delete plan |
| POST | `/api/blog-posts` | `BlogPostController@store` | Create post (with featured_image) |
| PUT | `/api/blog-posts/{blogPost}` | `BlogPostController@update` | Update post |
| DELETE | `/api/blog-posts/{blogPost}` | `BlogPostController@destroy` | Delete post |
| GET | `/api/admin/stats` | `StatsController@index` | Dashboard counts |
| GET | `/api/media` | `MediaController@index` | List media (paginated, with meta) |
| POST | `/api/media` | `MediaController@store` | Upload file |
| DELETE | `/api/media/{media}` | `MediaController@destroy` | Delete media |

---

## Frontend Architecture

### Stack
- **Next.js 16** with `output: 'export'` (SSG / static HTML)
- **Tailwind CSS v4** with CSS custom properties for theming
- **shadcn/ui** components for admin panel
- **Lucide icons** for admin, **Font Awesome** for public site
- **Quill** rich text editor for blog content
- **Zod** validation via `@amt/shared` package

### Page Structure

```
app/
├── layout.tsx              # Root layout — ThemeProvider, Google Fonts
├── globals.css             # CSS variables, Tailwind base styles
├── (public)/
│   ├── layout.tsx          # Public layout — Header + Footer + BackToTop
│   ├── page.tsx            # Homepage — PageRenderer + ServicesGrid + TeamGrid + PricingTable + Blog/Contact sections
│   └── not-found.tsx       # 404 page
└── admin/
    ├── layout.tsx          # Admin layout — Sidebar, auth guard, ToastProvider
    ├── page.tsx             # Redirects to /admin/dashboard
    ├── login/page.tsx      # Login form
    ├── forgot-password/page.tsx  # Password reset request
    ├── dashboard/page.tsx  # Stats Overview
    ├── services/page.tsx   # Services CRUD table
    ├── team/page.tsx       # Team Members CRUD table
    ├── blog-posts/page.tsx # Blog Posts CRUD with BlogEditor (Quill)
    ├── pages/page.tsx      # Pages CRUD with JSON sections editor
    ├── pricing-plans/page.tsx  # Pricing Plans CRUD with features
    └── media/page.tsx      # Media Library grid
```

### Component Structure

```
components/
├── Header.tsx           # Public site header with mobile drawer (client)
├── Footer.tsx           # Public site footer with newsletter + social (client)
├── BackToTop.tsx        # Scroll-to-top button (client)
├── ThemeProvider.tsx    # Fetches theme from API, injects CSS vars (server)
├── PageRenderer.tsx     # Renders page sections dynamically (server)
├── ServicesGrid.tsx     # Services cards grid (server)
├── TeamGrid.tsx         # Team member cards grid (server)
├── PricingTable.tsx     # Pricing plan cards (server)
├── BlogEditor.tsx       # Quill.js wrapper (client)
├── admin/
│   ├── sidebar.tsx      # Admin sidebar with nav groups (client)
│   ├── stats-overview.tsx  # Dashboard stat cards (client)
│   └── route-change-loader.tsx  # Loading indicator on route changes
└── ui/                  # shadcn/ui primitives
    ├── alert-dialog.tsx
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── label.tsx
    ├── progress.tsx
    ├── skeleton.tsx
    ├── spinner.tsx
    ├── table.tsx
    └── toast.tsx
```

### Data Flow

**Public pages (build-time):**
1. `fetch()` calls are made directly at the component level in Server Components
2. Each data component (`PageRenderer`, `ServicesGrid`, `TeamGrid`, `PricingTable`, `ThemeProvider`) calls its respective `fetch*()` function from `lib/api.ts`
3. Zod schemas from `@amt/shared` validate the API response (parsed via `.parse()`)
4. Components render with the fetched data or throw a build error if API is unreachable
5. Empty states are handled gracefully: `ServicesGrid`/`TeamGrid` return `null` if no data; `PageRenderer` shows "Coming Soon" if no published page

**Admin pages (client-side):**
1. All admin interactions happen after build — authenticated fetch calls to the Laravel API
2. Token stored in `localStorage`, attached via `Authorization: Bearer` header
3. CRUD operations in `lib/admin-api.ts` handle 401 (Unauthorized → redirect login), 422 (validation errors), and generic errors
4. Admin pages use `'use client'` pattern with state management via `useState`/`useEffect`
5. Media uploads bypass JSON and use `FormData` with Spatie's file handling

### Shared Schemas (`@amt/shared`)

Located at `packages/shared/src/schemas/` — Zod schemas that mirror the API response shapes:

| Schema File | Exports | Used By |
|-------------|---------|---------|
| `service.ts` | `ServiceSchema`, `ServicesResponseSchema` | `lib/api.ts` |
| `team-member.ts` | `TeamMemberSchema`, `TeamMembersResponseSchema` | `lib/api.ts` |
| `page.ts` | `PageSchema`, `PagesResponseSchema` | `lib/api.ts` |
| `blog-post.ts` | `BlogPostSchema`, `BlogPostsResponseSchema` | `lib/api.ts` |
| `pricing-plan.ts` | `PricingPlanSchema`, `PlanFeatureSchema`, `PricingPlansResponseSchema` | `lib/api.ts` |
| `theme.ts` | `ThemeSchema` | `lib/api.ts` |
| `contact.ts` | `ContactRequestSchema`, `ContactResponseSchema` | Validation |
| `subscriber.ts` | `SubscribeRequestSchema`, `SubscribeResponseSchema` | Validation |
| `auth.ts` | `UserSchema`, `LoginRequestSchema`, `LoginResponseSchema` | Validation |
| `stats.ts` | `DashboardStatsSchema` | Validation |
| `media.ts` | `MediaItemSchema`, `MediaListResponseSchema` | Validation |

---

## Database Schema

### Migrations (15 total)

| # | File | Table | Purpose |
|---|------|-------|---------|
| 1 | `0001_01_01_000000_create_users_table.php` | `users` | Admin users |
| 2 | `0001_01_01_000001_create_cache_table.php` | `cache` | Laravel cache |
| 3 | `0001_01_01_000002_create_jobs_table.php` | `jobs` | Queue jobs |
| 4 | `2026_07_18_144613_create_media_table.php` | `media` | Spatie media library |
| 5 | `2026_07_18_145007_create_contact_contact_messages_table.php` | `contact_contact_messages` | Contact form submissions |
| 6 | `2026_07_18_145007_create_contact_subscribers_table.php` | `contact_subscribers` | Newsletter subscribers |
| 7 | `2026_07_18_191518_create_personal_access_tokens_table.php` | `personal_access_tokens` | Sanctum tokens |
| 8 | `2026_07_19_000001_create_marketing_services_table.php` | `marketing_services` | Services |
| 9 | `2026_07_19_000002_create_marketing_team_members_table.php` | `marketing_team_members` | Team members |
| 10 | `2026_07_19_115824_create_theme_settings_table.php` | `theme_settings` | Theme colors/fonts |
| 11 | `2026_07_19_123000_create_marketing_pages_table.php` | `marketing_pages` | CMS pages |
| 12 | `2026_07_19_125500_create_media_libraries_table.php` | `media_libraries` | Media library container |
| 13 | `2026_07_21_000001_create_billing_pricing_plans_table.php` | `billing_pricing_plans` | Pricing plans |
| 14 | `2026_07_21_000002_create_billing_plan_features_table.php` | `billing_plan_features` | Plan features (1:N) |
| 15 | `2026_07_21_000003_create_marketing_blog_posts_table.php` | `marketing_blog_posts` | Blog posts |

### Key Relationships
- `pricing_plans` 1:N → `plan_features` (via `pricing_plan_id`)
- Spatie media polymorphic relationship on `media` table (`medially_type`, `medially_id`)

### Table Naming Convention
Tables use plural snake_case with domain prefixes:
- `billing_*` — billing/pricing domain
- `marketing_*` — marketing/content domain
- `contact_*` — contact/subscriber domain

---

## Key Design Decisions

1. **Flat Laravel structure** — No DDD/modules. All models, controllers, resources in flat namespaces for simplicity.
2. **API response envelope** — `{ "data": ... }` wrapper at the controller level via `ApiResponse` trait. Resources do NOT double-wrap.
3. **Spatie Query Builder** — Used in public `index()` methods for consistent sorting/filtering/pagination.
4. **Safe database queries** — `safeCount()` helper in StatsController wraps queries in try/catch for gracefully handling missing tables during development.
5. **Admin auth guards client-side** — Admin layout checks `isAuthenticated()` on client, redirects to login if no token. No server-side route protection needed (static export).
6. **Theme as API data** — Theme settings (colors, fonts) are stored in DB and fetched at build time, then injected as CSS custom properties. No build-time env variables for theming.
