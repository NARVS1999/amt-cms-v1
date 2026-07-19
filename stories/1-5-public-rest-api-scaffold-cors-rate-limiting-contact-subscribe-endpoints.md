# Story 1.5: Public REST API — Scaffold, CORS, Rate Limiting, Contact & Subscribe Endpoints

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **frontend developer**,
I want **the API infrastructure scaffolded with consistent JSON responses, CORS, rate limiting, and the contact/subscribe endpoints**,
So that **the API contract is established for all downstream domain epics to implement their GET endpoints**.

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
**And** each group has empty controller methods or route stubs ready for domain epic implementation

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
**Then** HTTP 422 with "already subscribed" message

**Given** I POST `/api/subscribe` more than 3 times in one minute from the same IP
**When** rate limiting triggers
**Then** HTTP 429

**Given** I GET `/api/nonexistent`
**Then** HTTP 404

**Given** a POST request with an `Origin` header from a non-deployed domain in production
**When** CORS middleware runs
**Then** the request is rejected

**Migrations created:** `contact_contact_messages` table, `contact_subscribers` table

**UX-DR coverage:** UX-DR13 (A11Y — error announcements via aria-describedby)

## Tasks / Subtasks

- [x] **Set up API response structure** (AC: consistent JSON envelope)
  - [x] Create `app/Http/Resources/Api/ApiResource.php` base resource class (wraps data in `{ "data": ... }`)
  - [x] Create `ApiResponse` trait for error responses
  - [x] Ensure all responses follow: `{ "data": ... }` for success, `{ "message": "...", "errors": {...} }` for validation errors
- [x] **Define API route groups** (AC: 8 route groups with stubs)
  - [x] Configure `routes/api.php` with 8 route groups:
    - `pages`, `services`, `team`, `blog-posts`, `pricing-plans`, `theme` (GET — stubs for now)
    - `contact`, `subscribe` (POST — full implementation)
  - [x] Create stub controller classes for GET endpoints (will be implemented in Epics 2-5)
  - [x] Create full controllers for contact and subscribe endpoints
- [x] **Create Contact domain** (AC: ContactMessage model + migration)
  - [x] Create models in `apps/backend/app/Models/`
  - [x] Create migration: `create_contact_contact_messages_table`
    - `id`, `name` (string 255), `email` (string 255), `message` (text), `read_at` (timestamp nullable), timestamps
  - [x] Create `ContactMessage` model
- [x] **Create Subscribe domain** (AC: Subscriber model + migration)
  - [x] Create migration: `create_contact_subscribers_table`
    - `id`, `email` (string 255, unique), `subscribed_at` (timestamp), timestamps
  - [x] Create `Subscriber` model
- [x] **Implement ContactController** (AC: POST /api/contact with validation)
  - [x] Create `ContactController` with `store()` method
  - [x] Create `ContactRequest` FormRequest with validation rules:
    - `name`: required, string, max:255
    - `email`: required, email, max:255
    - `message`: required, string, max:5000
  - [x] On success: create ContactMessage, return HTTP 201
- [x] **Implement SubscribeController** (AC: POST /api/subscribe with duplicate handling)
  - [x] Create `SubscribeController` with `store()` method
  - [x] Create `SubscribeRequest` FormRequest with validation:
    - `email`: required, email, max:255, unique:contact_subscribers,email
  - [x] Handle duplicate email → return 422 with "Already subscribed." message
- [x] **Configure CORS** (AC: restricted origins in production)
  - [x] Configure `config/cors.php`:
    - `allowed_origins`: `*` in local, restricted to frontend domain in production
    - `supports_credentials`: false (public API)
    - `allowed_methods`: ['*']
    - `allowed_headers`: ['*']
- [x] **Implement rate limiting** (AC: 5/min contact, 3/min subscribe)
  - [x] Configure rate limiters in `AppServiceProvider`
  - [x] Contact: 5 attempts per minute per IP
  - [x] Subscribe: 3 attempts per minute per IP
  - [x] Use `RateLimiter` facade, file cache (no Redis)
- [x] **Handle 404 for unknown routes** (AC: HTTP 404 on unknown API routes)
  - [x] Ensure `routes/api.php` fallback returns 404 for undefined routes
- [x] **Run migrations** (AC: contact + subscribe tables created)
  - [x] `php artisan migrate` — verify both new tables created

## Dev Notes

### API Route Structure (MANDATORY — must match exactly)

```php
// File: routes/api.php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\SubscribeController;
// Stub controllers for GET endpoints:
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\PricingPlanController;
use App\Http\Controllers\Api\ThemeController;

// GET endpoints (stubs — full implementation in Epics 2-5)
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/team', [TeamMemberController::class, 'index']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);

Route::get('/pricing-plans', [PricingPlanController::class, 'index']);

Route::get('/theme', [ThemeController::class, 'index']);

// POST endpoints (full implementation in this story)
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact');
Route::post('/subscribe', [SubscribeController::class, 'store'])
    ->middleware('throttle:subscribe');
```

### Controller/Route Directory Structure

```
app/Http/Controllers/Api/
├── ContactController.php       # FULL implementation in this story
├── SubscribeController.php     # FULL implementation in this story
├── PageController.php          # STUB — index() returns empty data array
├── ServiceController.php       # STUB — index() returns empty data array
├── TeamMemberController.php    # STUB — index() returns empty data array
├── BlogPostController.php      # STUB — index/show() returns empty data
├── PricingPlanController.php   # STUB — index() returns empty data array
└── ThemeController.php         # STUB — index() returns empty data array
```

Stub controllers should return `response()->json(['data' => []])` for GET index and `response()->json(['data' => null])` or 404 for show.

### Model Locations

```
app/Models/
├── ContactMessage.php
└── Subscriber.php
app/Http/Requests/
├── ContactRequest.php
└── SubscribeRequest.php
```

### Migration Specifications

**contact_contact_messages:**
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

**contact_subscribers:**
```php
Schema::create('contact_subscribers', function (Blueprint $table) {
    $table->id();
    $table->string('email', 255)->unique();
    $table->timestamp('subscribed_at')->nullable();
    $table->timestamps();
});
```

### CORS Configuration

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => env('CORS_ALLOWED_ORIGINS', '*') 
        ? explode(',', env('CORS_ALLOWED_ORIGINS')) 
        : ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
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

```php
// In AppServiceProvider::boot() or RouteServiceProvider::boot()
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('contact', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

RateLimiter::for('subscribe', function (Request $request) {
    return Limit::perMinute(3)->by($request->ip());
});
```

**IMPORTANT:** Rate limiter uses Cache facade. By default Laravel uses `file` cache driver locally. In production, database-backed caching should be configured. Do NOT use Redis.

### Response Format Examples

**Success (HTTP 201):**
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

### Response Envelope Helpers

Create a reusable trait or helper:
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

### Architecture Compliance

- **AD-3:** REST API is the contract — consistent JSON envelope, `{ "data": ... }` for success
- **AD-5:** Admin is sole content authority — only contact/subscribe POST endpoints on public API
- **AD-8:** Queued email with DB fallback — message stored before email dispatch (email queueing in Story 6.3)

### Testing Requirements

- **POST /api/contact** with valid data → HTTP 201, ContactMessage created with `read_at: null`
- **POST /api/contact** with missing name → HTTP 422 with validation error
- **POST /api/contact** with missing email → HTTP 422 with validation error
- **POST /api/contact** with missing message → HTTP 422 with validation error
- **POST /api/contact** 6 times in quick succession → HTTP 429 on 6th request
- **POST /api/subscribe** with valid email → HTTP 201, Subscriber created
- **POST /api/subscribe** with duplicate email → HTTP 422 "Already subscribed."
- **POST /api/subscribe** 4 times in quick succession → HTTP 429 on 4th request
- **GET /api/nonexistent** → HTTP 404
- **CORS:** POST with non-matching Origin → should be rejected (in production mode)

### Non-Functional Constraints

- **NFR-3:** CORS restricted to deployed frontend domain in production
- **NFR-5:** Rate limiting (5/min contact, 3/min subscribe per IP), database-backed
- **NFR-9:** Environment-driven configuration (CORS origins in `.env`)

### References

- [Source: docs/epics.md#Story-1.5] — Full AC
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3---REST-API-is-the-contract] — Response envelope spec
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Rate limiting, CORS, error envelope
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Domain directory structure
- [Source: docs/project-context.md#Laravel-12-Backend-Framework] — API directory rules
- [Source: docs/project-context.md#Testing-Rules] — API endpoint testing requirements
- [Source: docs/prds/prd.md#FR-15-Public-REST-API] — API endpoint table
- [Source: docs/prds/prd.md#FR-9-Contact-Form-Submission] — Contact form requirements
- [Source: docs/prds/prd.md#FR-10-Newsletter-Subscription] — Newsletter requirements

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- ApiResponse trait created with `success()` and `error()` helper methods.
- ApiResource base class created wrapping data in `{ "data": ... }`.
- Migrations created and ran for `contact_contact_messages` and `contact_subscribers` tables.
- ContactMessage model, Subscriber model, ContactRequest, SubscribeRequest created.
- ContactController and SubscribeController fully implemented with validation and JSON responses.
- 6 stub controllers created (Page, Service, TeamMember, BlogPost, PricingPlan, Theme) returning `{ "data": [] }`.
- routes/api.php configured with all 8 route groups + 404 fallback.
- bootstrap/app.php updated with API routing and exception handlers (404, 422, 429 JSON responses).
- config/cors.php created — env-driven allowed origins, credentials disabled.
- AppServiceProvider registers rate limiters: contact (5/min), subscribe (3/min) per IP.
- All endpoints tested with curl: services (200), contact valid (201), contact missing fields (422), subscribe (201), duplicate (422), 404 fallback, rate limiting (429).

### File List

- `apps/backend/routes/api.php`
- `apps/backend/bootstrap/app.php`
- `apps/backend/config/cors.php`
- `apps/backend/app/Providers/AppServiceProvider.php`
- `apps/backend/app/Traits/ApiResponse.php`
- `apps/backend/app/Http/Resources/Api/ApiResource.php`
- `apps/backend/app/Http/Controllers/Api/ContactController.php`
- `apps/backend/app/Http/Controllers/Api/SubscribeController.php`
- `apps/backend/app/Http/Controllers/Api/PageController.php`
- `apps/backend/app/Http/Controllers/Api/ServiceController.php`
- `apps/backend/app/Http/Controllers/Api/TeamMemberController.php`
- `apps/backend/app/Http/Controllers/Api/BlogPostController.php`
- `apps/backend/app/Http/Controllers/Api/PricingPlanController.php`
- `apps/backend/app/Http/Controllers/Api/ThemeController.php`
- `apps/backend/app/Models/ContactMessage.php`
- `apps/backend/app/Models/Subscriber.php`
- `apps/backend/app/Http/Requests/ContactRequest.php`
- `apps/backend/app/Http/Requests/SubscribeRequest.php`
- `apps/backend/database/migrations/*_create_contact_contact_messages_table.php`
- `apps/backend/database/migrations/*_create_contact_subscribers_table.php`
- `apps/backend/app/Http/Resources/Api/ApiResource.php` (base resource)
- `apps/backend/app/Traits/ApiResponse.php` (response helper trait)
- `apps/backend/config/cors.php` (CORS configuration)
