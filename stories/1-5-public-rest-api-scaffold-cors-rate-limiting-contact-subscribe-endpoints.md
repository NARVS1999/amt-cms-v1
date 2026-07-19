# Story 1.5: Public REST API — Scaffold, CORS, Rate Limiting, Contact & Subscribe Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **frontend developer**,
I want **the API infrastructure scaffolded with consistent JSON responses, CORS, rate limiting, and the contact/subscribe endpoints**,
So that **the API contract is established for all downstream domain epics to implement their GET endpoints**.

**IMPORTANT — Current State:** This story was partially implemented during earlier Epics 1/2. Below documents what exists and what must be verified/completed. The dev agent should verify all existing code is correct and complete any gaps.

## Acceptance Criteria

**Given** the API routes are defined in `routes/api.php`
**When** any endpoint returns a response
**Then** the response structure follows the consistent JSON:API-style envelope:
- Success: `{ "data": ... }`
- Validation error: `{ "message": "...", "errors": { "field": ["..."] } }`
- Server error: `{ "message": "..." }`

**Given** I declare API route groups in `routes/api.php`
**When** I check the route structure
**Then** route groups exist for: `pages`, `services`, `team`, `blog-posts`, `pricing-plans`, `theme`, `contact`, `subscribe`
**And** GET endpoints for resources already implemented in Epic 2 have full implementations (not stubs):
  - `GET /api/pages` — returns published pages sorted by id (PageController)
  - `GET /api/pages/{slug}` — returns single published page or 404
  - `GET /api/services` — returns services sorted by sort_order (ServiceController)
  - `GET /api/team` — returns team members with media sorted by sort_order (TeamMemberController)
**And** the following remain as stubs returning `{ "data": [] }`:
  - `GET /api/blog-posts` and `GET /api/blog-posts/{slug}` (BlogPostController — Epic 4)
  - `GET /api/pricing-plans` (PricingPlanController — Epic 3)
  - `GET /api/theme` (ThemeController — Epic 5)

**Given** I POST `/api/contact` with valid `name`, `email`, `message`
**When** validation passes
**Then** HTTP 201 with success message
**And** a new `ContactMessage` record is created in the database with `read_at: null`

**Given** I POST `/api/contact` with missing fields
**When** validation fails
**Then** HTTP 422 with `{ "message": "...", "errors": { "field": ["..."] } }`

**Given** I POST `/api/contact` more than 5 times in one minute from the same IP
**When** rate limiting triggers
**Then** HTTP 429 with rate limit message

**Given** I POST `/api/subscribe` with a valid email
**Then** HTTP 201 with success message
**And** a new `Subscriber` record is created

**Given** I POST `/api/subscribe` with a duplicate email
**Then** HTTP 422 with "Already subscribed." message

**Given** I POST `/api/subscribe` more than 3 times in one minute from the same IP
**When** rate limiting triggers
**Then** HTTP 429

**Given** I GET `/api/nonexistent`
**Then** HTTP 404

**Given** a POST request with an `Origin` header from a non-deployed domain in production
**When** CORS middleware runs
**Then** the request is rejected

**Given** a rate limited admin login attempt
**When** POST `/api/admin/login` is hit more than 5 times in one minute from the same IP
**Then** HTTP 429

**Given** an unauthenticated request to any admin-only endpoint
**When** the Sanctum auth middleware runs
**Then** HTTP 401

**Given** a POST request to an admin-only endpoint (e.g. `POST /api/services`) without a valid Sanctum token
**When** the `auth:sanctum` middleware runs
**Then** HTTP 401

**Migrations created:** `contact_contact_messages` table, `contact_subscribers` table

**UX-DR coverage:** UX-DR13 (A11Y — error announcements via aria-describedby)

## Tasks / Subtasks

### 1. API Response Infrastructure (AC: consistent JSON envelope)
- [x] **1.1 Create `ApiResponse` trait** with `success()` and `error()` methods
  - `success(mixed $data, int $code = 200): JsonResponse` → wraps in `{ "data": $data }`
  - `error(string $message, int $code = 400, array $errors = []): JsonResponse` → wraps in `{ "message": "...", "errors": {...} }`
- [x] **1.2 Configure exception handlers** in `bootstrap/app.php`:
  - `ValidationException` → HTTP 422 with `{ "message": "...", "errors": {...} }`
  - `NotFoundHttpException` → HTTP 404 with `{ "message": "Not found." }`
  - `ThrottleRequestsException` → HTTP 429 with `{ "message": "Too many attempts. Please try again in 60 seconds." }`

### 2. API Route Groups (AC: 8 route groups, mixed stubs + full)
- [x] **2.1 Configure `routes/api.php`** with three logical sections:
  - Public GET endpoints (8 routes)
  - Public POST endpoints (2 routes — contact, subscribe)
  - Admin auth endpoints (1 login route + Sanctum-protected group)
- [x] **2.2 Implement full controllers** for Pages, Services, Team Members (implemented in Epic 2)
- [x] **2.3 Create stub controllers** for BlogPost, PricingPlan, Theme (return `{ "data": [] }`)
- [x] **2.4 Create full controllers** for Contact and Subscribe (this story)
- [x] **2.5 Add 404 fallback** in `routes/api.php` for unknown API routes

### 3. Contact Domain (AC: ContactMessage model + POST endpoint)
- [x] **3.1 Create `ContactMessage` model** in `app/Models/`
- [x] **3.2 Create migration:** `create_contact_contact_messages_table`
- [x] **3.3 Create `ContactRequest` FormRequest** with validation rules
- [x] **3.4 Implement `ContactController::store()`** — create record, return HTTP 201
- [x] **3.5 Handle errors:** catch exceptions on create, return HTTP 500 with user-friendly message

### 4. Subscribe Domain (AC: Subscriber model + POST endpoint)
- [x] **4.1 Create `Subscriber` model** in `app/Models/`
- [x] **4.2 Create migration:** `create_contact_subscribers_table`
- [x] **4.3 Create `SubscribeRequest` FormRequest** with unique email validation
- [x] **4.4 Implement `SubscribeController::store()`** — create record, return HTTP 201
- [x] **4.5 Handle duplicate email:** FormRequest `unique` rule returns 422 with "Already subscribed."

### 5. CORS Configuration (AC: restricted origins in production)
- [x] **5.1 Configure `config/cors.php`:**
  - `allowed_origins`: env-driven, `*` in dev, comma-separated domains in prod
  - `supports_credentials`: `true` (Sanctum auth)
  - `allowed_methods`: `['*']`
  - `allowed_headers`: `['*']`
  - `paths`: `['api/*', 'sanctum/csrf-cookie']`

### 6. Rate Limiting (AC: 5/min contact, 3/min subscribe, 5/min admin-login)
- [x] **6.1 Configure rate limiters** in `AppServiceProvider::boot()`:
  - `contact`: 5 attempts per minute per IP
  - `subscribe`: 3 attempts per minute per IP
  - `admin-login`: 5 attempts per minute per IP
- [x] **6.2 Apply `throttle:contact` middleware** to POST /api/contact
- [x] **6.3 Apply `throttle:subscribe` middleware** to POST /api/subscribe
- [x] **6.4 Apply `throttle:admin-login` middleware** to POST /api/admin/login
- [x] **6.5 Verify:** All rate limiters use `file` cache driver (no Redis dependency)

### 7. Testing (AC: all API endpoint scenarios covered)
- [x] **7.1 Create contact endpoint tests:**
  - [x] Valid submission → HTTP 201, ContactMessage created with `read_at: null`
  - [x] Missing name → HTTP 422
  - [x] Missing email → HTTP 422
  - [x] Missing message → HTTP 422
  - [x] Rate limit exceeded (6th request) → HTTP 429
- [x] **7.2 Create subscribe endpoint tests:**
  - [x] Valid email → HTTP 201, Subscriber created
  - [x] Duplicate email → HTTP 422 "Already subscribed."
  - [x] Rate limit exceeded (4th request) → HTTP 429
- [x] **7.3 Create 404 handling test:**
  - [x] GET /api/nonexistent → HTTP 404
- [x] **7.4 Create auth protection tests:**
  - [x] Unauthenticated POST to admin endpoint (e.g. POST /api/services) → HTTP 401
  - [x] Authenticated POST with valid Sanctum token → works (HTTP 201 or validation error)

## Dev Notes

### API Route Structure (MANDATORY — must match exactly)

```php
// File: routes/api.php — current structure as implemented

// --- GET endpoints (public, read-only) ---
Route::get('/pages', [PageController::class, 'index']);                    // Full — Epic 2
Route::get('/pages/{slug}', [PageController::class, 'show']);              // Full — Epic 2
Route::get('/services', [ServiceController::class, 'index']);              // Full — Epic 2
Route::get('/team', [TeamMemberController::class, 'index']);               // Full — Epic 2
Route::get('/blog-posts', [BlogPostController::class, 'index']);           // Stub — Epic 4
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);     // Stub — Epic 4
Route::get('/pricing-plans', [PricingPlanController::class, 'index']);     // Stub — Epic 3
Route::get('/theme', [ThemeController::class, 'index']);                   // Stub — Epic 5

// --- POST endpoints (public, rate-limited) ---
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact');
Route::post('/subscribe', [SubscribeController::class, 'store'])
    ->middleware('throttle:subscribe');

// --- Admin auth ---
Route::post('/admin/login', [AdminAuthController::class, 'login'])
    ->middleware('throttle:admin-login');

// --- Sanctum-protected admin routes ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/pages', [PageController::class, 'adminIndex']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    Route::post('/team', [TeamMemberController::class, 'store']);
    Route::put('/team/{teamMember}', [TeamMemberController::class, 'update']);
    Route::delete('/team/{teamMember}', [TeamMemberController::class, 'destroy']);
    Route::post('/pages', [PageController::class, 'store']);
    Route::put('/pages/{page}', [PageController::class, 'update']);
    Route::delete('/pages/{page}', [PageController::class, 'destroy']);
    Route::get('/admin/stats', [StatsController::class, 'index']);
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
});

Route::fallback(function () {
    return response()->json(['message' => 'Not found.'], 404);
});
```

### Exception Handling (in `bootstrap/app.php`)

```php
->withExceptions(function (Exceptions $exceptions) {
    // 422 — Validation errors
    $exceptions->render(function (ValidationException $e, Request $request) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], $e->status);
        }
    });

    // 404 — Not found
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json(['message' => 'Not found.'], 404);
        }
    });

    // 429 — Rate limited
    $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Too many attempts. Please try again in 60 seconds.',
            ], 429);
        }
    });
})->create();
```

### Response Envelope Helpers (`app/Traits/ApiResponse.php`)

```php
trait ApiResponse
{
    protected function success(mixed $data, int $code = 200): JsonResponse
    {
        return response()->json(['data' => $data], $code);
    }

    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = ['message' => $message];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $code);
    }
}
```

### Controller/Route Directory Structure

```
app/Http/Controllers/Api/
├── AdminAuthController.php      # FULL — login, me, logout (Story 1.2)
├── StatsController.php          # FULL — dashboard stats (Story 1.3)
├── MediaController.php          # FULL — media CRUD (Story 1.4)
├── ContactController.php        # FULL — POST /api/contact (this story)
├── SubscribeController.php      # FULL — POST /api/subscribe (this story)
├── PageController.php           # FULL — pages CRUD (Epic 2)
├── ServiceController.php        # FULL — services CRUD (Epic 2)
├── TeamMemberController.php     # FULL — team CRUD (Epic 2)
├── BlogPostController.php       # STUB — Epic 4
├── PricingPlanController.php    # STUB — Epic 3
└── ThemeController.php          # STUB — Epic 5
```

### Model Locations

```
app/Models/
├── ContactMessage.php           # $table = 'contact_contact_messages'
└── Subscriber.php               # $table = 'contact_subscribers'
app/Http/Requests/
├── ContactRequest.php           # name, email, message validation
└── SubscribeRequest.php         # email validation + unique check
```

### Migration Specifications

**contact_contact_messages (already created):**
```php
Schema::create('contact_contact_messages', function (Blueprint $table) {
    $table->id();
    $table->string('name', 255);
    $table->string('email', 255);
    $table->text('message');
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
});
```

**contact_subscribers (already created):**
```php
Schema::create('contact_subscribers', function (Blueprint $table) {
    $table->id();
    $table->string('email', 255)->unique();
    $table->timestamp('subscribed_at')->nullable();
    $table->timestamps();
});
```

### CORS Configuration

`config/cors.php` — env-driven, credentials enabled for Sanctum auth:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*'))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

In `.env`:
```
# Production: comma-separated allowed origins
CORS_ALLOWED_ORIGINS=https://adsvance-media-tech.com

# Local: allow all
CORS_ALLOWED_ORIGINS=*
```

### Rate Limiting Configuration

In `AppServiceProvider::boot()`:

```php
RateLimiter::for('contact', fn (Request $r) => Limit::perMinute(5)->by($r->ip() ?? 'internal'));
RateLimiter::for('subscribe', fn (Request $r) => Limit::perMinute(3)->by($r->ip() ?? 'internal'));
RateLimiter::for('admin-login', fn (Request $r) => Limit::perMinute(5)->by($r->ip() ?? 'internal'));
```

**IMPORTANT:** All rate limiters use the default `file` cache driver. No Redis dependency (NFR-10, NFR-11).

### Request Validation Messages

**ContactRequest messages()** — user-friendly, matches UX-DR10:
```
'name.required'    => 'Your name is required.',
'email.required'   => 'Your email address is required.',
'email.email'      => 'Please provide a valid email address.',
'message.required' => 'A message is required.',
'message.max'      => 'Message must not exceed 5000 characters.',
```

**SubscribeRequest messages()** — matches UX-DR11:
```
'email.required' => 'An email address is required.',
'email.email'    => 'Please provide a valid email address.',
'email.unique'   => 'Already subscribed.',
```

### Response Format Examples

**Success (HTTP 201) — Contact:**
```json
{
    "data": {
        "message": "Thank you! We'll get back to you soon.",
        "contact_message": {
            "id": 1,
            "name": "Maria Santos",
            "email": "maria@example.com",
            "created_at": "2026-07-18T10:30:00Z"
        }
    }
}
```

**Success (HTTP 201) — Subscribe:**
```json
{
    "data": {
        "message": "Welcome! You've been subscribed successfully.",
        "subscriber": {
            "id": 1,
            "email": "user@example.com",
            "subscribed_at": "2026-07-18T10:30:00Z"
        }
    }
}
```

**Duplication Error (HTTP 422) — subscribe duplicate:**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["Already subscribed."]
    }
}
```

**Validation Error (HTTP 422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "message": ["The message field is required."]
    }
}
```

**Rate Limited (HTTP 429):**
```json
{
    "message": "Too many attempts. Please try again in 60 seconds."
}
```

**Server Error (HTTP 500):**
```json
{
    "message": "Could not submit message. Please try again."
}
```

**Unauthenticated (HTTP 401):**
```json
{
    "message": "Unauthenticated."
}
```

### Model Details

**ContactMessage** (`app/Models/ContactMessage.php`, table: `contact_contact_messages`):
```php
class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'message', 'read_at'];
    protected $casts = ['read_at' => 'datetime'];
}
```

**Subscriber** (`app/Models/Subscriber.php`, table: `contact_subscribers`):
```php
class Subscriber extends Model
{
    protected $fillable = ['email', 'subscribed_at'];
    protected $casts = ['subscribed_at' => 'datetime'];
}
```

### Architecture Compliance

- **AD-1:** Flat Laravel structure — models in `app/Models/`, controllers in `app/Http/Controllers/Api/`, requests in `app/Http/Requests/`. No DDD boundaries.
- **AD-3:** REST API is the contract — consistent `{ "data": ... }` envelope via `ApiResponse` trait. Validation errors via exception handler.
- **AD-5:** Admin is sole content authority — GET endpoints are public; POST/PUT/DELETE require `auth:sanctum`. Only contact/subscribe POST endpoints are public.
- **AD-7:** Content flow is unidirectional — API is read-only for public GET, POST for submissions only.
- **AD-8:** Queued email with DB fallback — ContactMessage stored before email dispatch (email queueing deferred to Story 6.3).

### Testing Requirements

Existing test files (if missing, create a new test file):
- `apps/backend/tests/Feature/*Test.php` — check for an API scaffold test or contact/subscribe tests

Required test coverage (already implemented in previous Epics 1/2, verify all exist):

**Contact endpoint tests:**
1. Valid submission → HTTP 201, record created with `read_at: null`
2. Missing name → HTTP 422
3. Missing email → HTTP 422
4. Missing message → HTTP 422
5. Rate limit (6 requests in quick succession) → HTTP 429 on 6th

**Subscribe endpoint tests:**
6. Valid email → HTTP 201, record created
7. Duplicate email → HTTP 422 "Already subscribed."
8. Rate limit (4 requests in quick succession) → HTTP 429 on 4th

**Infrastructure tests:**
9. Unknown route → GET /api/nonexistent → HTTP 404
10. Unauthenticated → POST /api/services without token → HTTP 401
11. Authenticated → POST /api/services with token → HTTP 201 or validation error
12. CORS → preflight OPTIONS with non-matching Origin → rejected in production mode

### Non-Functional Constraints

- **NFR-3:** CORS restricted to deployed frontend domain in production. `supports_credentials: true` for Sanctum token auth.
- **NFR-5:** Rate limiting (5/min contact, 3/min subscribe per IP), file cache backed (no Redis). Admin login also rate-limited at 5/min.
- **NFR-6:** Authentication via Laravel Sanctum — token-based, no session cookies for API. Admin passwords hashed via bcrypt.
- **NFR-9:** All configuration environment-driven — CORS origins in `.env`, no hardcoded URLs.
- **NFR-10:** Zero-cost software — no paid APIs, no SaaS dependencies. File cache for rate limiting, not Redis.
- **NFR-16:** No raw SQL — Eloquent ORM throughout. FormRequest validation prevents injection.
- **AD-3:** Consistent JSON envelope — `{ "data": ... }` for success, `{ "message": "...", "errors": {...} }` for errors.

### Dependencies

- **Laravel Sanctum** — already installed and configured for API token auth (Story 1.2)
- **Laravel built-in CORS** — no additional package needed (Laravel 12 handles via middleware)
- **Laravel RateLimiter** — built-in facade, no additional package
- **No Redis** — file cache driver for rate limiting in all environments

### Previous Story Intelligence (from Story 1.4)

- **Controller pattern:** Use `use App\Traits\ApiResponse` trait for consistent JSON responses. Controllers extend base `Controller` class. No inline validation — use FormRequest classes.
- **Error handling in controllers:** Wrap `Model::create()` in try/catch. On failure, return `$this->error('User-friendly message.', 500)`.
- **API client pattern (frontend):** Centralized API client in `apps/frontend/lib/admin-api.ts` with `useCallback` + `AbortController` for data fetching. Custom `UnauthorizedError` class for 401 handling.
- **Testing pattern:** Use `RefreshDatabase` trait. Assert JSON structure with `assertJsonStructure` and `assertJsonPath`. Use `assertJsonCount` for array lengths.
- **Migration naming:** `YYYY_MM_DD_HHMMSS_create_{table}_table.php`
- **SQLite compatibility:** Avoid `->change()` with SQLite-incompatible operations in migrations. Use raw `$table->unique('column')` without `->change()`.

### Git Intelligence

Recent commits show the codebase progression:
- `f28883b` — "re implement and test 1.3" (Dashboard stats)
- `5478a13` — "review 1.1"
- `23f4af7` — "update 1.2"
- `57283f2` — "audit code and fixed"
- `ab4e53e` — "remove filament and DDD approach" (architecture pivot)
- `92cedfd` — "replace filament by shadcn, laravel focus on api only"

The architecture pivot from Filament/DDD to Next.js/shadcn + flat Laravel is complete. This story's code is a product of that pivot.

### References

- [Source: docs/epics.md#Story-1.5] — Full AC
- [Source: docs/epics.md#FR-9] — Contact form requirements
- [Source: docs/epics.md#FR-10] — Newsletter requirements
- [Source: docs/epics.md#FR-15] — Public REST API requirements
- [Source: docs/epics.md#NFR-5] — Rate limiting requirements
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — Response envelope spec
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Rate limiting, CORS, error envelope
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Domain directory structure
- [Source: docs/project-context.md#Laravel-12-Backend-Framework] — API directory rules
- [Source: docs/project-context.md#Testing-Rules] — API endpoint testing requirements
- [Source: docs/project-context.md#Critical-Implementation-Rules] — No raw SQL, env-driven config, Eloquent only
- [Source: apps/backend/routes/api.php] — Current routes
- [Source: apps/backend/app/Providers/AppServiceProvider.php] — Rate limiter setup
- [Source: apps/backend/app/Traits/ApiResponse.php] — Response helpers
- [Source: apps/backend/app/Http/Controllers/Api/ContactController.php] — Contact implementation
- [Source: apps/backend/app/Http/Controllers/Api/SubscribeController.php] — Subscribe implementation
- [Source: apps/backend/app/Http/Requests/ContactRequest.php] — Contact validation
- [Source: apps/backend/app/Http/Requests/SubscribeRequest.php] — Subscribe validation
- [Source: apps/backend/app/Models/ContactMessage.php] — Contact model
- [Source: apps/backend/app/Models/Subscriber.php] — Subscriber model
- [Source: apps/backend/bootstrap/app.php] — Exception handling
- [Source: apps/backend/config/cors.php] — CORS configuration

## Dev Agent Record

### Agent Model Used

deepseek-v4-flash (opencode-go/deepseek-v4-flash)

### Debug Log References

### Completion Notes List

- Story 1.5 has been partially implemented across previous Epics 1 and 2 sessions. The API infrastructure (CORS, rate limiting, exception handling) is wired up, contact/subscribe endpoints are fully implemented, and GET endpoints for Pages/Services/TeamMembers are fully implemented as part of Epic 2.
- The remaining stub controllers (BlogPost, PricingPlan, Theme) will be fully implemented in their respective Epics (4, 3, 5).
- All 29 backend tests pass with 206 assertions (prior to this session).
- Frontend `npm run build` passes with no errors (prior to this session).

### Session Completion (2026-07-19)

- Implemented all missing tests in `apps/backend/tests/Feature/ContactSubscribeTest.php` covering:
  - Contact: valid submission (201 + read_at:null), missing name/email/message (422), rate limit (429)
  - Subscribe: valid email (201), duplicate email (422), rate limit (429)
  - 404 handling: GET /api/nonexistent (404)
  - Auth: unauthenticated POST /api/services (401), authenticated POST with Sanctum token (201)
- Ran full test suite: 40 tests pass with 283 assertions
- Marked all 7.x tasks as [x] in story file
- Updated story status to "review"

### Code Review Findings Applied (2026-07-19)

- Decision resolved: Admin login rate limit test — added `test_admin_login_rate_limit()` (6th request → 429)
- Patch F1: Missing CORS test — added `test_cors_rejects_non_matching_origin()` verifying non-matching origin is rejected
- Patch F2: Spec duplication error response example — fixed to match actual Laravel output (`"The given data was invalid."`)
- Deferred items: Cache::flush() in rate limit tests (fine with array driver), identical contact payloads in rate limit test (not a performance concern)
- Code review findings all resolved. Story status → done.

### File List

Existing files (do not modify unless fixing bugs):
- `apps/backend/routes/api.php` — All route groups configured
- `apps/backend/bootstrap/app.php` — Exception handlers (422, 404, 429)
- `apps/backend/config/cors.php` — CORS config
- `apps/backend/app/Providers/AppServiceProvider.php` — Rate limiters
- `apps/backend/app/Traits/ApiResponse.php` — Response helpers
- `apps/backend/app/Http/Controllers/Api/ContactController.php` — Full
- `apps/backend/app/Http/Controllers/Api/SubscribeController.php` — Full
- `apps/backend/app/Http/Controllers/Api/PageController.php` — Full (Epic 2)
- `apps/backend/app/Http/Controllers/Api/ServiceController.php` — Full (Epic 2)
- `apps/backend/app/Http/Controllers/Api/TeamMemberController.php` — Full (Epic 2)
- `apps/backend/app/Http/Controllers/Api/BlogPostController.php` — Stub
- `apps/backend/app/Http/Controllers/Api/PricingPlanController.php` — Stub
- `apps/backend/app/Http/Controllers/Api/ThemeController.php` — Stub
- `apps/backend/app/Models/ContactMessage.php`
- `apps/backend/app/Models/Subscriber.php`
- `apps/backend/app/Http/Requests/ContactRequest.php`
- `apps/backend/app/Http/Requests/SubscribeRequest.php`
- `apps/backend/database/migrations/*_create_contact_contact_messages_table.php`
- `apps/backend/database/migrations/*_create_contact_subscribers_table.php`

New files:
- `apps/backend/tests/Feature/ContactSubscribeTest.php` — 13 tests covering contact (5), subscribe (3), 404 (1), auth (2), admin login rate limit (1), CORS (1)

## Code Review Findings

### Decisions Needed

- [x] [Review][Decision] Admin login rate limit test scope — resolved: add test to ContactSubscribeTest.php.

### Patches

- [x] [Review][Patch] Missing CORS test — added `test_cors_rejects_non_matching_origin()` to ContactSubscribeTest.php
- [x] [Review][Patch] Spec response example mismatch — updated to match actual Laravel exception handler output (`"message": "The given data was invalid."`)

### Deferred

- [x] [Review][Defer] `Cache::flush()` in rate limit tests — aggressive, clears all cache state. Works correctly with `array` driver in phpunit.xml but would be problematic with `file` driver. Deferred: current test config uses `array` driver, no production impact.
- [x] [Review][Defer] Identical contact payloads in rate limit test — 5 identical POSTs create 5 identical DB rows. Functional but not ideal. Deferred: not a performance concern at this scale.
