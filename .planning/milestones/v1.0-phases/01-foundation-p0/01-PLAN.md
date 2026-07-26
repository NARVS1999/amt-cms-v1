---
id: 01-01
wave: 1
type: feature
requirements: [FR-12]
depends_on: []
files_modified:
  - apps/backend/app/Http/Controllers/Api/AdminAuthController.php
  - apps/backend/routes/api.php
  - apps/backend/app/Http/Controllers/Api/ForgotPasswordController.php
  - apps/backend/app/Http/Controllers/Api/ResetPasswordController.php
  - apps/frontend/lib/admin-api.ts
  - apps/frontend/app/admin/login/page.tsx
  - apps/frontend/app/admin/forgot-password/page.tsx
autonomous: true
---

# Plan 01-01: Auth System — Remember Me + Password Reset

## Objective

Implement D-03 (forgot/reset password flow) and D-04 (Remember Me token expiry) on top of the existing Sanctum auth system.

## Context

AdminAuthController already has login/me/logout. Password reset table migration exists but no controller or UI. Login page has "Remember me" checkbox but token always uses default Sanctum expiry.

## Tasks

### Task 01-01-01: Remember Me Token Expiry

<read_first>
- apps/backend/app/Http/Controllers/Api/AdminAuthController.php
- apps/backend/config/sanctum.php
</read_first>

<action>
Modify `AdminAuthController::login` to accept `remember` boolean. When `true`, set token `expires_at` to 30 days; when `false`, set to 24 hours. Use Sanctum's `$token->expires_at` on the `NewAccessToken` instance before returning.
</action>

<acceptance_criteria>
- `POST /api/admin/login` with `remember: true` returns a token with 30-day expiry
- `POST /api/admin/login` with `remember: false` returns a token with 24-hour expiry
- Existing login behavior unchanged for clients that don't send `remember`
</acceptance_criteria>

---

### Task 01-01-02: Forgot Password API

<read_first>
- apps/backend/routes/api.php
- apps/backend/app/Http/Controllers/Api/AdminAuthController.php
- apps/backend/app/Models/User.php
- apps/backend/config/auth.php
</read_first>

<action>
Create `App\Http\Controllers\Api\ForgotPasswordController` with `sendResetLink(Request)` method:
- Validates email exists in users table
- Generates password reset token via `Password::broker()->createToken()`
- For dev mode (APP_ENV=local): returns token in response for testing
- For production: sends `ResetPasswordNotification` with the token URL
- Rate-limited to 1 request per 60 seconds per email

Add route: `POST /api/forgot-password` (outside auth:sanctum, with throttle:3,1)
</action>

<acceptance_criteria>
- `POST /api/forgot-password` with valid email returns `{ "message": "Password reset link sent." }` (or `{ "token": "..." }` in local)
- `POST /api/forgot-password` with invalid email returns 422 validation error
- Token stored in `password_reset_tokens` table
</acceptance_criteria>

---

### Task 01-01-03: Reset Password API

<read_first>
- apps/backend/app/Http/Controllers/Api/ForgotPasswordController.php
- apps/backend/config/auth.php
- app/Models/User.php
</read_first>

<action>
Create `App\Http\Controllers\Api\ResetPasswordController` with `reset(Request)`:
- Validates `email`, `token`, `password`, `password_confirmation`
- Resets password via `Password::broker()->reset()`
- Returns success response

Add route: `POST /api/reset-password` (outside auth:sanctum)
</action>

<acceptance_criteria>
- `POST /api/reset-password` with valid token+email+password resets the password
- Invalid/expired token returns validation error
- Password confirmed via `password_confirmation` field
- After reset, old tokens remain valid (user must re-login)
</acceptance_criteria>

---

### Task 01-01-04: Frontend Forgot Password Page

<read_first>
- apps/frontend/app/admin/login/page.tsx
- apps/frontend/lib/admin-api.ts
</read_first>

<action>
Create `apps/frontend/app/admin/forgot-password/page.tsx`:
- "Forgot password?" link below login form
- Centered card with email field
- Submit calls `POST /api/forgot-password`
- Success state: "Check your email for a reset link."
- Error state: inline error message
- Loading state: button shows "Sending..."

Add "Forgot password?" link to login page below the Sign in button.
Add `forgotPassword(email)` function to `lib/admin-api.ts`.
</action>

<acceptance_criteria>
- "Forgot password?" link visible on login page
- Forgot password page renders centered card with email input
- Successful submission shows success message
- API error shows inline error
- Back to login link returns to `/admin/login`
</acceptance_criteria>

---

### Task 01-01-05: Auth Feature Tests

<read_first>
- apps/backend/tests/Feature/ServicesTest.php
- apps/backend/app/Http/Controllers/Api/AdminAuthController.php
</read_first>

<action>
Create `apps/backend/tests/Feature/AuthTest.php` with:
- `test_user_can_login_with_valid_credentials` — asserts token returned + structure
- `test_user_cannot_login_with_invalid_credentials` — asserts 422 + generic error
- `test_user_can_logout` — login → logout → old token rejected
- `test_authenticated_user_can_access_me` — asserts user object returned
- `test_unauthenticated_user_cannot_access_me` — asserts 401
- `test_user_can_request_password_reset` — asserts token created
- `test_user_can_reset_password` — asserts password changed
- `test_remember_me_returns_token_with_extended_expiry` — asserts token works after 24h (use with in-memory time)
</action>

<acceptance_criteria>
- All 8 tests pass via `php artisan test --filter=AuthTest`
- Tests use `RefreshDatabase` trait
- Tests follow existing patterns from ServicesTest
</acceptance_criteria>

<threat_model>
| Threat ID | Description | SeverITY | Mitigation |
|-----------|-------------|----------|------------|
| T-01-01 | Credential exposure in response | high | Never return password hash in any response; use `$user->makeHidden('password')` |
| T-01-02 | Token replay after logout | high | Delete current token on logout; `currentAccessToken()->delete()` already implemented |
| T-01-03 | Password reset token brute force | medium | Token is 64-char hex; rate-limit forgot-password to 3/min |
| T-01-04 | Email enumeration via forgot-password | medium | Always return same message regardless of whether email exists; log internally |
</threat_model>

---

## Plan 01-02: API Response Standardization + Query Builder

<read_first>
- apps/backend/routes/api.php
- apps/backend/app/Traits/ApiResponse.php
- apps/backend/composer.json
- apps/backend/app/Http/Resources/Api/ApiResource.php
- apps/backend/app/Http/Resources/Api/ServiceResource.php
</read_first>

<id>01-02</id>
<wave>1</wave>
<type>refactor</type>
<requirements>[FR-15]</requirements>
<depends_on>[]</depends_on>

### Task 01-02-01: Audit and Standardize API Responses

<read_first>
- apps/backend/app/Traits/ApiResponse.php
- apps/backend/app/Http/Controllers/Api/ServiceController.php
- apps/backend/app/Http/Controllers/Api/PricingPlanController.php
- apps/backend/app/Http/Controllers/Api/TeamMemberController.php
- apps/backend/app/Http/Controllers/Api/BlogPostController.php
- apps/backend/app/Http/Controllers/Api/PageController.php
</read_first>

<action>
Audit all public GET controllers in `app/Http/Controllers/Api/`:
1. Ensure each uses the `ApiResponse` trait
2. Ensure each returns `$this->success()` for successful responses
3. Ensure paginated responses use the `meta` block format (current_page, last_page, per_page, total)
4. Standardize error responses to use `$this->error()`
5. Where controllers return raw `response()->json()`, replace with `$this->success()`
</action>

<acceptance_criteria>
- All public GET endpoints return `{ "data": ... }` envelope
- Paginated endpoints include `meta` block with current_page, last_page, per_page, total
- Validation errors use Laravel default format: `{ "message": "...", "errors": { "field": ["..."] } }`
</acceptance_criteria>

---

### Task 01-02-02: Install and Integrate spatie/laravel-query-builder

<read_first>
- apps/backend/composer.json
- apps/backend/app/Http/Controllers/Api/ServiceController.php
</read_first>

<action>
1. Check if `spatie/laravel-query-builder` is in composer.json. If not, require it.
2. Apply `QueryBuilder` to public GET endpoints:
   - `GET /api/services` — allowed sorts: title, sort_order, created_at; allowed filters: title
   - `GET /api/team` — allowed sorts: sort_order, name, created_at
   - `GET /api/blog-posts` — allowed sorts: published_at, title, created_at; allowed filters: title, is_published
   - `GET /api/pricing-plans` — allowed sorts: sort_order, price, created_at
   - `GET /api/pages` — allowed sorts: title, created_at
</action>

<acceptance_criteria>
- `?sort=title` works on `/api/services` returning sorted results
- `?filter[title]=value` works on filterable endpoints
- Invalid sort/filter values return 400 error
- All tests still pass after integration
</acceptance_criteria>

---

## Plan 01-03: Missing Shared Zod Schemas

<id>01-03</id>
<wave>2</wave>
<type>feature</type>
<requirements>[FR-12, FR-14, FR-15]</requirements>
<depends_on>[01-02]</depends_on>

### Task 01-03-01: Create Auth and User Zod Schemas

<read_first>
- packages/shared/src/schemas/service.ts
- packages/shared/src/index.ts
</read_first>

<action>
Create `packages/shared/src/schemas/auth.ts`:
```typescript
export const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string() });
export const LoginRequestSchema = z.object({ email: z.string().email(), password: z.string(), remember: z.boolean().optional() });
export const LoginResponseSchema = z.object({ token: z.string(), user: UserSchema });
export const ForgotPasswordRequestSchema = z.object({ email: z.string().email() });
export const ResetPasswordRequestSchema = z.object({ email: z.string().email(), token: z.string(), password: z.string().min(8), password_confirmation: z.string() });
```
Export from `packages/shared/src/index.ts`.
</action>

<acceptance_criteria>
- `auth.ts` exports all schemas with correct Zod types
- Importable from `@amt/shared`
- Build passes with `npx tsc --noEmit` from `packages/shared/`
</acceptance_criteria>

---

### Task 01-03-02: Create Stats and Media Zod Schemas

<read_first>
- packages/shared/src/schemas/service.ts
- packages/shared/src/index.ts
</read_first>

<action>
Create `packages/shared/src/schemas/stats.ts` with DashboardStatsSchema.
Create `packages/shared/src/schemas/media.ts` with MediaItemSchema, MediaListResponseSchema.

Export from `packages/shared/src/index.ts`.
</action>

<acceptance_criteria>
- All new schemas export correctly
- Build passes
</acceptance_criteria>

---

## Plan 01-04: Feature Tests for Media + Stats

<id>01-04</id>
<wave>2</wave>
<type>test</type>
<requirements>[FR-13, FR-14]</requirements>
<depends_on>[01-02]</depends_on>

### Task 01-04-01: Media Feature Tests

<read_first>
- apps/backend/tests/Feature/MediaTest.php
</read_first>

<action>
Review and ensure `MediaTest.php` covers:
- Upload JPG, PNG, WebP, SVG files
- Upload invalid file type (e.g., .exe) returns 422
- Upload file >2MB returns 422
- Browse returns paginated list with meta
- Delete media item
- Delete non-existent media returns 404
- SVG sanitization strips script tags
</action>

<acceptance_criteria>
- All media tests pass via `php artisan test --filter=MediaTest`
</acceptance_criteria>

---

## must_haves

### truths
- Auth system uses Sanctum token-based auth with email/password
- Login returns token + user object, never password
- Dashboard stats return counts for services, blog_posts, unread_messages, subscribers
- All public GET endpoints return `{ "data": ... }` envelope
- Paginated endpoints include meta block with current_page, last_page, per_page, total
- Media upload accepts JPG/PNG/WebP/SVG, rejects other formats
- Media delete shows confirmation dialog and removes file from storage
- SVG files are sanitized (script tags and event handlers stripped)
- Shared Zod schemas in `packages/shared` mirror API response shapes
- Forgot password generates reset token and sends link (or returns in dev)
- Reset password validates token + email + password confirmation
- Remember Me checkbox extends token lifetime to 30 days
- Admin login page shows centered card with email/password/remember/forgot-password
- Dashboard shows loading skeleton cards while fetching stats
- Dashboard shows error alert when stats fail to load
- Media library shows grid of thumbnails with upload button and delete confirmation dialog
- Media library shows empty state when no media exists

### Backstop
- { statement: "Admin login page is responsive on mobile viewports (320px+)" , verification: backstop }
- { statement: "Dashboard stat grid adapts from 1 column (mobile) to 4 columns (desktop)" , verification: backstop }
- { statement: "Media library grid adapts from 2 columns (mobile) to 5 columns (desktop lg)" , verification: backstop }
- { statement: "Long media filenames are truncated with ellipsis in grid view" , verification: backstop }
- { statement: "GridView/ListView toggle in media library maintains state between renders" , verification: backstop }

### prohibitions
- { statement: "Never hardcode brand colors — use var(--color-*) or Tailwind theme classes", status: resolved, verification: source }
- { statement: "No raw SQL — Eloquent ORM only", status: resolved, verification: source }
- { statement: "No Storage::put() — Spatie Media Library for all uploads", status: resolved, verification: source }
- { statement: "No getServerSideProps — SSG only", status: resolved, verification: source }
- { statement: "Never return password hashes in any API response", status: resolved, verification: source }

---

## Artifacts This Phase Produces

### New Files
- `apps/backend/app/Http/Controllers/Api/ForgotPasswordController.php`
- `apps/backend/app/Http/Controllers/Api/ResetPasswordController.php`
- `apps/frontend/app/admin/forgot-password/page.tsx`
- `apps/backend/tests/Feature/AuthTest.php`
- `packages/shared/src/schemas/auth.ts`
- `packages/shared/src/schemas/stats.ts`
- `packages/shared/src/schemas/media.ts`

### Modified Files
- `apps/backend/app/Http/Controllers/Api/AdminAuthController.php` (remember me)
- `apps/backend/routes/api.php` (forgot/reset routes)
- `apps/frontend/lib/admin-api.ts` (forgotPassword function)
- `apps/frontend/app/admin/login/page.tsx` (forgot password link)
- `packages/shared/src/index.ts` (new schema exports)
- Various API controllers (response standardization)
