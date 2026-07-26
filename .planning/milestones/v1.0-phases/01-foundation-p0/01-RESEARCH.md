# Phase 1: Foundation (P0) — Technical Research

**Date:** 2026-07-23
**Status:** Complete

---

## Standard Stack

| Concern | Decision | Details |
|---------|----------|---------|
| Language | PHP 8.3 / TypeScript 5.x | Laravel 12 backend, Next.js 16 frontend |
| Auth | Laravel Sanctum (token-based) | `HasApiTokens` trait on User model; `auth:sanctum` middleware for protected routes |
| API format | `{ "data": ... }` envelope | `ApiResponse` trait with `success()` and `error()` methods |
| Media | spatie/laravel-medialibrary | v11+; `MediaLibrary` model with `->addMedia()` / `->toMediaCollection()` |
| Pagination | Laravel `->paginate()` | Returns `current_page`, `last_page`, `per_page`, `total` in `meta` |
| Query builder | spatie/laravel-query-builder | Not yet implemented in controllers; needs integration for sort/filter |
| Frontend admin UI | Next.js 16 App Router (client components) | shadcn/ui components (button, card, input, label, table, alert-dialog) |
| Icons | lucide-react (admin), fontawesome-free (public) | |
| Font | Inter (admin), Poppins (public) | |
| State management | React useState/useEffect | No global state library; token in localStorage under `admin_token` |

---

## Existing Code Inventory

### Already Built (No Change Needed)

| Component | Path | Status |
|-----------|------|--------|
| User model with Sanctum | `app/Models/User.php` | ✅ Complete |
| AdminAuthController (login/me/logout) | `app/Http/Controllers/Api/AdminAuthController.php` | ✅ Complete |
| API routes | `routes/api.php` | ✅ Complete (all routes defined) |
| StatsController | `app/Http/Controllers/Api/Admin/StatsController.php` | ✅ Complete |
| MediaController (CRUD) | `app/Http/Controllers/Api/MediaController.php` | ✅ Complete |
| Admin login page | `app/admin/login/page.tsx` | ✅ Complete |
| Admin dashboard page | `app/admin/dashboard/page.tsx` | ✅ Complete |
| Admin media page (grid, upload, delete) | `app/admin/media/page.tsx` | ✅ Complete |
| Sidebar | `components/admin/sidebar.tsx` | ✅ Complete |
| StatsOverview component | `components/admin/stats-overview.tsx` | ✅ Complete |
| admin-api.ts (all CRUD functions) | `lib/admin-api.ts` | ✅ Complete |
| Migrations (all tables) | `database/migrations/*` | ✅ Complete |
| Shared Zod schemas (8 files) | `packages/shared/src/schemas/*` | ✅ 8 schemas exist |
| shadcn UI components | `components/ui/*.tsx` | ✅ 6 components |

### Missing / Needs Work

| Item | Priority | Details |
|------|----------|---------|
| Password reset API | P0 (D-03) | No controller or routes exist; migration for `password_reset_tokens` table exists but no implementation |
| spatie/laravel-query-builder integration | P0 (D-08) | Installed? Not yet used; need `AllowedSort`/`AllowedFilter` on public GET endpoints |
| ApiResponse trait usage in controllers | P0 (D-07) | Some controllers don't use the trait; need audit + standardization |
| `{ "data": ... }` envelope for all public GET endpoints | P0 (FR-15) | Response format needs to be consistent across all controllers |
| Shared Zod schemas for login response, stats, media | P0 | Missing schemas for: `AuthResponse` (token + user), `DashboardStats`, `MediaItem`, paginated media response |
| Public API Resource classes | P0 | Some resources exist (ServiceResource, BlogPostResource, etc.), need review for consistency |
| Auth feature tests | P0 | No tests for login/logout/me endpoints |
| Remember Me token expiry | P0 (D-04) | Sanctum token abilities or expiry for "remember me" not implemented |

---

## Auth Architecture

### Current Flow
1. `POST /api/admin/login` → validates email+password → creates Sanctum token → returns `{ "token", "user": { id, name, email } }`
2. Frontend stores token in `localStorage` under `admin_token`
3. `isAuthenticated()` checks for token presence
4. Authenticated requests include `Authorization: Bearer {token}` header
5. `POST /api/logout` → deletes current token → response `{ "message": "Logged out." }`
6. `GET /api/me` → returns `{ "user": { id, name, email } }`

### Password Reset (To Build)
Need to implement:
- `POST /api/forgot-password` — validates email, generates token, sends email (or returns token in dev)
- `POST /api/reset-password` — validates token+email+password, resets password
- For v1 without mail setup: dev-mode return token in response; production-ready: Laravel `Password::broker()` + mail notification

### Remember Me (D-04)
Sanctum tokens can set expiry via `$token->expires_at`. For "remember me": extend token lifetime (e.g., 30 days vs 24 hours).

---

## API Response Conventions

### Pagination Format (D-07)
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 24,
    "total": 100
  }
}
```

### Error Format (D-09)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Query Builder Support (D-08)
Install `spatie/laravel-query-builder` (check if already in composer.json). Apply to public GET endpoints:
```php
use Spatie\QueryBuilder\QueryBuilder;

$services = QueryBuilder::for(Service::class)
    ->allowedSorts(['title', 'sort_order', 'created_at'])
    ->allowedFilters(['title'])
    ->paginate();
```

---

## Shared Zod Schemas

### Pattern
```typescript
// packages/shared/src/schemas/service.ts
import { z } from 'zod';
export const ServiceSchema = z.object({ ... });
export const ServicesResponseSchema = z.object({ data: z.array(ServiceSchema) });
export type Service = z.infer<typeof ServiceSchema>;
```

### Missing Schemas for Phase 1
- `auth.ts` — `LoginRequestSchema`, `LoginResponseSchema`, `UserSchema`
- `stats.ts` — `DashboardStatsSchema`
- `media.ts` — `MediaItemSchema`, `MediaListResponseSchema`

---

## Existing Feature Tests

| Test File | What It Covers | Notes |
|-----------|---------------|-------|
| `StatsTest.php` | Stats endpoint response shape | Uses `safeCount()` |
| `ServicesTest.php` | Public GET, sorting, empty data | |
| `MediaTest.php` | Upload, browse, delete media files | Uses Spatie |
| `PricingPlansTest.php` | Public GET + eager loading | |
| `TeamMembersTest.php` | Public GET + sort | |
| `BlogPostsTest.php` | Public GET + slug lookup | |
| `PagesTest.php` | Public GET + slug lookup | |
| `ContactSubscribeTest.php` | Contact form + subscribe POST | |

---

## Validation Architecture (Nyquist)

### Phase 1 Success Criteria Validation
1. Admin login with email/password → Test: login succeeds for valid credentials, fails for invalid
2. Dashboard stats widgets → Test: stats returns correct counts
3. Public GET endpoints with `{ "data": ... }` → Test: all endpoints return consistent format
4. Media library upload/browse/delete → Test: upload JPG/PNG/WebP/SVG, list, delete
5. Shared Zod schemas → Test: schemas parse API responses correctly

### Nyquist Dimensions
- **Dimension 1 (Identity)**: Phase 1 produces the foundation — auth identity (User), admin identity, API identity
- **Dimension 2 (Dependencies)**: Sanctum (laravel/sanctum), Spatie Media Library, spatie/laravel-query-builder, Zod
- **Dimension 3 (Boundaries)**: Auth boundary (public vs admin), API boundary (sanctum middleware), file upload boundary (mime validation, SVG sanitization)
- **Dimension 4 (States)**: Loading/error/empty for all admin pages; auth states (logged in, logged out, token expired)
- **Dimension 5 (Data Flow)**: Admin writes → MySQL → REST API → SSG build → static HTML (unidirectional)
- **Dimension 6 (Side Effects)**: Token creation/deletion, file upload/storage/deletion on S3/local
- **Dimension 7 (Error Modes)**: Invalid credentials, expired token, uploaded file too large/invalid type, SVG with script tags
- **Dimension 8 (Validation)**: Feature tests exist for most but auth/password-reset tests are missing

---

## Key Implementation Notes

1. **SVG Sanitization**: MediaController already strips `<script>` tags and `on*` event handlers from SVGs before storage
2. **Rate Limiting**: `throttle:admin-login`, `throttle:contact`, `throttle:subscribe` middleware already configured in routes
3. **Stats safeCount**: Uses try/catch to handle missing tables gracefully — returns 0 instead of throwing
4. **Media pagination**: 24 items per page, ordered by `created_at desc`
5. **Token auth**: Frontend redirects to `/admin/login` on 401 response (via `UnauthorizedError`)
6. **Admin layout**: Login page renders without sidebar; all other admin pages render with Sidebar component
