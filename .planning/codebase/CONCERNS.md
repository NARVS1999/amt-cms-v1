# Concerns & Technical Debt

> **Generated:** 2026-07-26
> **Scope:** Full-stack audit of the AMT_V2 monorepo (Laravel 12 backend + Next.js 16 SSG frontend + shared Zod schemas).

---

## Technical Debt

### Missing HTMLPurifier Integration (NFR-4)

Blog post content from Quill.js (rich HTML) is stored and returned as-is with **zero sanitization**.

- `BlogPostController@store`/`@update` — accepts raw HTML `content` and stores it directly
- `BlogPostController@show` — returns the unsanitized HTML to the public API
- The `packages/shared` schemas define `content: z.string()` with no purification step
- No HTMLPurifier package installed or configured in `composer.json`

**Files:** `apps/backend/app/Http/Controllers/Api/BlogPostController.php:41-49`
**Doc reference:** `docs/SPEC.md` §Section `Project Context` says "All rich text sanitized via HTMLPurifier" — not implemented.
**Risk:** XSS via blog content on public site.

### Inline Validation in Controllers (Violates Project Rules)

Project-context.md states: *"All API input validation in Laravel FormRequest classes. Never validate inline in controllers."* The following controllers use inline `$request->validate([...])` instead of dedicated FormRequest classes:

| Controller | Method | File |
|---|---|---|
| `ServiceController` | store, update | `apps/backend/app/Http/Controllers/Api/ServiceController.php:29` |
| `BlogPostController` | store, update | `apps/backend/app/Http/Controllers/Api/BlogPostController.php:41` |
| `PricingPlanController` | store, update | `apps/backend/app/Http/Controllers/Api/PricingPlanController.php:40` |
| `PageController` | store, update | `apps/backend/app/Http/Controllers/Api/PageController.php:52` |
| `TeamMemberController` | store, update | `apps/backend/app/Http/Controllers/Api/TeamMemberController.php:30` |
| `AdminAuthController` | login | `apps/backend/app/Http/Controllers/Api/AdminAuthController.php:19` |
| `MediaController` | store | `apps/backend/app/Http/Controllers/Api/MediaController.php:49` |

Only `ContactController` uses a FormRequest (`ContactRequest`).

### No Admin-Specific Pricing Plans GET Route (Known Bug)

`GET /api/pricing-plans` filters by `is_published: true` in `index()`. The admin has no separate endpoint to see unpublished plans. The admin uses the same public route.

**Files:** `apps/backend/app/Http/Controllers/Api/PricingPlanController.php:16-26`, `apps/backend/routes/api.php:40`
**Doc reference:** `docs/ERROR-HANDLING.md:203`, `docs/SPEC.md:312`

### BlogPostController Returns Draft Posts on Public API (Known Bug)

`BlogPostController@index()` does not filter by `is_published`. All posts (including drafts) are returned to the public API.

**Files:** `apps/backend/app/Http/Controllers/Api/BlogPostController.php:16-26`
**Doc reference:** `docs/ERROR-HANDLING.md:202`, `docs/SPEC.md:321`

### MediaController Does Not Use ApiResponse Trait

Returns `{ data, meta }` manually instead of using the `ApiResponse` trait. Response envelope is inconsistent with all other controllers.

**File:** `apps/backend/app/Http/Controllers/Api/MediaController.php:36-44,80-91`
**Doc reference:** `docs/ERROR-HANDLING.md:205`, `docs/SPEC.md:18`

### Duplicate Frontend Type Interfaces

`apps/frontend/lib/admin-api.ts` and `apps/frontend/lib/api.ts` define identical interfaces (`ServiceData`, `TeamMemberData`, `PageData`, `PricingPlanData`, `PlanFeatureData`). These duplicate the `z.infer` types available from `@amt/shared`. Risk of drift.

**Doc reference:** `docs/ERROR-HANDLING.md:206`, `docs/SPEC.md:754`

### ThemeSchema Unused

`@amt/shared` exports a `ThemeSchema` but `fetchTheme()` in `lib/api.ts` bypasses it and casts `json.data as ThemeData` with no validation.

**Doc reference:** `stories/deferred-work.md:20`

### No Frontend Test Infrastructure

`apps/frontend/package.json` has no test script and no test dependencies. No Vitest, Jest, or React Testing Library. Only ESLint and TypeScript type-checking are available.

**Doc references:** `apps/frontend/package.json`, `stories/deferred-work.md:9`

### Epic 5 (Theme System) and Epic 6 (Contact & Leads) in Backlog

| Story | Status | Purpose |
|---|---|---|
| 5.1 | backlog | Theme settings admin page |
| 5.2 | backlog | CSS custom property generation |
| 6.1 | backlog | Contact form public UI |
| 6.2 | backlog | Newsletter subscribe UI |
| 6.3 | backlog | Email notification for contact messages |

Theme data is served by a backend `ThemeController` that exists, but the admin page to *manage* themes is not built. Contact form and newsletter API endpoints exist but have **no frontend UI**.

### ContactController Missing Email Dispatch

`ContactController@store` saves the message to the database but does **not** dispatch any email notification. The queue job and notification class are not implemented (Epic 6 is backlog).

**File:** `apps/backend/app/Http/Controllers/Api/ContactController.php:14-36`

### StatsController Silent Error Swallowing

`safeCount()` wraps every query in try/catch and returns `0` on any error. This masks real database issues (e.g., missing columns, connection failures) during admin usage. The method was designed to handle missing tables during early development but is now a bug-hiding liability.

**File:** `apps/backend/app/Http/Controllers/Api/Admin/StatsController.php:25-36`

### Legacy Static Site in Repository

The `legacy/` directory contains the old static HTML marketing site (~90 files including CSS and images). These are no longer used by the CMS but remain in the repository, increasing clone size and confusing developers.

---

## Security

### Admin Token Stored in localStorage

The Sanctum Bearer token is stored in `localStorage` via `admin-api.ts`:
- `localStorage.getItem('admin_token')`
- `localStorage.setItem('admin_token', token)`

This is **XSS-vulnerable**. Any XSS flaw in the admin panel (e.g., from unsanitized blog content preview) would expose the admin token. HttpOnly cookies would be more secure but would require stateful Sanctum SPA authentication.

**Files:** `apps/frontend/lib/admin-api.ts:3-14`, `apps/frontend/app/admin/login/page.tsx:28`

### CORS Falls Back to Wildcard

`config/cors.php:20` defaults to `'*'` if `CORS_ALLOWED_ORIGINS` env is not set. If the production deployment omits this env variable, any domain can make API requests.

**File:** `apps/backend/config/cors.php:20`

### SVG Sanitization Uses Regex

`MediaController@store` uses `preg_replace` to strip `<script>` tags and `on*` event handler attributes from SVG files. This can be bypassed with:
- Nested script tags
- JavaScript in `<use>` or `<a>` href attributes
- Event handlers via attribute encoding
- `xlink:href` with `javascript:` protocol

**File:** `apps/backend/app/Http/Controllers/Api/MediaController.php:59-65`

### No Backend Message Length Limit for Contact Form

Frontend limits contact messages to 5000 chars via Zod, but the backend `ContactRequest` has no `max` rule on the `message` field.

**Doc reference:** `docs/ERROR-HANDLING.md:129`

### No Role-Based Access Control

All authenticated admin users have full access. No permission system, no role hierarchy. `auth:sanctum` is the only guard. Acceptable for v1 single-admin usage but a risk if the admin user base grows.

**Doc reference:** `stories/deferred-work.md:5`

### No CSRF Protection on Token-Based Auth

The API uses Bearer tokens, not SPA cookie-based session auth. This means there is no CSRF protection layer. While token-based auth is inherently immune to CSRF for state-changing requests (the token must be known), the Sanctum config still has `ValidateCsrfToken` middleware configured for stateful domains.

**File:** `apps/backend/config/sanctum.php:84`

---

## Performance

### Image Conversions Run Synchronously

`config/media-library.php:81` sets `'queue_connection_name' => env('QUEUE_CONNECTION', 'sync')`. Image conversions (thumbnails, responsive images) execute during the upload HTTP request. This adds significant latency to media uploads, especially for large images.

**File:** `apps/backend/config/media-library.php:81`

### No API Response Caching (NFR-2 Shortfall)

NFR-2 requires <200ms API response times, and `docs/project-context.md` explicitly says "Use Laravel's built-in caching where appropriate." However:
- No `Cache::remember()` or response caching anywhere in controllers
- Cache store defaults to `database` driver (slow for anything)
- No `Cache::put()` used for any endpoint

**Files:** `apps/backend/config/cache.php:18`, all controllers in `apps/backend/app/Http/Controllers/Api/`

### Admin Endpoints Return All Records (No Pagination)

While public endpoints use `paginate()` (via `QueryBuilder`), admin endpoints like `PricingPlanController@adminIndex`, `PageController@adminIndex`, and `ServiceController@store` use `->get()` with no pagination. Only `MediaController@index` is paginated (24/page). For small datasets this is fine, but it will become a problem as content grows.

### Database-Backed Cache is Slow

The default cache store is `'database'` (not Redis, not file). Database-backed cache queries add overhead to every cache hit/miss, making API response caching (if implemented) less effective.

**File:** `apps/backend/config/cache.php:41-47`

---

## Fragile Areas

### SQLite in Tests vs MySQL in Production

`phpunit.xml` uses SQLite `:memory:`. MySQL in production. Key differences:
- SQLite has **no ENUM column type** — `interval` field on pricing plans is a `string(50)` with app-level validation in tests
- SQLite evaluates `where('is_published', true)` differently — `true` evaluates to `1` which works, but boolean handling differs
- SQLite does NOT enforce foreign key constraints by default — orphaned records may go undetected in tests
- SQLite has different JSON function support — the `sections` and `social_links` JSON fields may behave differently

### `pricing_plan_id` Foreign Key on `billing_plan_features`

`docs/SPEC.md:102` shows `pricing_plan_id` as `bigInteger(20)` with FK → `billing_pricing_plans`. The actual migration may or may not have an explicit foreign key constraint. If not, orphaned features could exist after plan deletion (though controller deletes features manually in `update()`).

### Price Field Type Mismatch (Decimal in DB, Number in TS)

DB stores `price` as `decimal(10,2)`. The PHP `PricingPlanResource` casts this to a float. TypeScript interfaces use `number`. On very large values (e.g., `99999999.99`), float precision can cause rounding errors.

### Sanctum Token `expires_at` Set After Creation

`AdminAuthController@login:35-38` creates the token, then sets `expires_at` on `$token->accessToken` and calls `->save()`. This is an extra DB write. If the save fails, the token has no expiry.

### Contact Form Email Queue Not Running

Default `QUEUE_CONNECTION` is `database`, and the queue worker is not configured to run on Hostinger shared hosting. Even when Epic 6 implements the email notification, the queue worker process is needed.

### BlogEditor Uses Raw `innerHTML` Set

`BlogEditor.tsx:46` sets `quill.root.innerHTML = value` to update the editor content. If `value` contains unsanitized content (e.g., from auto-save restore), this could execute scripts in the editor context.

### No `react-quill` Package — Raw Quill Usage

`BlogEditor.tsx` uses the `quill` npm package directly (not `react-quill`). The integration is hand-rolled with refs and `innerHTML` manipulation. This is fragile and may not handle React strict mode double-mount correctly.

### Login API Response Shape Ambiguity

`AdminAuthController@login:40-47` uses `$this->success([...])` which wraps in `{ data: { token, user } }`. The frontend `login()` in `admin-api.ts:61-66` expects `res.data` containing `{ token, user }`. This works but the response differs from the standard `{ data: { ... } }` pattern used for resource objects — auth uses a flat success with nested `token` and `user`.

### Legacy Filament/DDD Code Audit Needed

`sprint-status.yaml:96-97` notes: *"Originally built under Filament/DDD. Docs rewritten for Next.js/shadcn + flat Laravel. Code needs audit."* Some controllers/models may still contain patterns from the old architecture.

---

## Known Gaps

### Deferred Features (v1.1)

| Feature | Reference |
|---|---|
| Contact message management (FR-11) | `docs/SPEC.md`, `docs/epics.md:61` |
| Admin role/permission system | `stories/deferred-work.md:5` |
| Error boundaries on admin pages | `stories/deferred-work.md:7` |

### Missing Story Coverage

| NFR | Requirement | Status |
|---|---|---|
| NFR-4 | Content sanitization (HTMLPurifier) | **Missing** — no story covers it |
| NFR-8 | Graceful degradation (API-down build) | Partially implemented in `ThemeProvider.tsx` |
| NFR-2 | API response caching | No implementation |
| NFR-12 | Holistic WCAG 2.2 AA audit | Distributed across stories, no centralized audit |

### Accessibility Audit Gaps

WCAG 2.2 AA requirements are scattered across stories as UX-DR coverage references. No single story or QA pass audits accessibility holistically. Risk of missed requirements.

### Environment Consistency

The `.env` file in `apps/backend/` is committed to the repo (confirmed by directory listing showing `.env`). This is a security risk as it may contain credentials.

**File:** `apps/backend/.env` (present in repo)

### No CI/CD Pipeline

Deployment is manual (FTP to Hostinger). No CI configuration. The build process (`npm run build` in frontend, `php artisan migrate` in backend) is entirely manual.
