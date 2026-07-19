# Blind Hunter — Story 1.2 Code Review

> Invoke the `bmad-review-adversarial-general` skill on this diff.

## Diff to Review

The changes are between commit `7bd5c82` and `HEAD` (57283f2). Files changed:

### Backend — AuthController (`apps/backend/app/Http/Controllers/Api/AuthController.php`)
- `POST /api/login` — validates email + password, returns Sanctum token on success, 422 on failure
- `GET /api/me` — returns authenticated user info (Sanctum-protected)
- `POST /api/logout` — revokes current token

### Backend — API Routes (`apps/backend/routes/api.php`)
- Auth routes: `/login`, `/me`, `/logout`
- Sanctum-protected admin CRUD routes: services, team, pages, media
- Public GET routes: pages, services, team, blog-posts, pricing-plans, theme
- Public POST routes: contact (throttled 5/min), subscribe (throttled 3/min)
- Media routes: `/media` GET/POST/DELETE (Sanctum-protected)
- 404 fallback for unknown routes

### Frontend — Admin Layout (`apps/frontend/app/admin/layout.tsx`)
- Client component with auth guard (redirects to `/admin/login` if unauthenticated)
- Dark sidebar (#1e1b2e, 260px) with grouped navigation: Main (Dashboard, Services, Team, Blog, Pricing), Leads (Messages, Subscribers), Settings (Theme, Media Library, Pages)
- Uses Lucide icons for all nav items
- Logout button in sidebar footer
- Inter typeface via CSS variable

### Frontend — Login Page (`apps/frontend/app/admin/login/page.tsx`)
- Client component with shadcn/ui Card, Input, Button, Label
- Email/password form → `POST /api/login` via admin-api.ts
- On success: stores token via `setToken()`, redirects to `/admin`
- On error: shows inline error message via `aria-live="polite"` region
- Loading state disables button during submission

### Frontend — Media Page (`apps/frontend/app/admin/media/page.tsx`)
- Client component, displays media grid with upload + delete
- Upload via hidden file input triggered by Button click
- Supports JPG, PNG, WebP, SVG (max 2MB server-side)
- Delete with confirmation dialog
- Loading state, empty state, uploading state

### Frontend — Admin API Client (`apps/frontend/lib/admin-api.ts`)
- Token stored in `localStorage` as `admin_token`
- `request()` helper handles auth header, 401 → UnauthorizedError, 422 → structured error
- Functions: login, logout, fetchMe, CRUD for services/team/pages
- Media functions: fetchMedia, uploadMedia (multipart/form-data), deleteMedia

### Global CSS (`apps/frontend/app/globals.css`)
- Admin CSS variables: sidebar-bg (#1e1b2e), sidebar-text (#a5a3b5), sidebar-active (#ffffff), admin-primary (#FF0000), etc.
- shadcn/ui theme variables in `:root`

### Root Layout (`apps/frontend/app/layout.tsx`)
- Google Fonts: Poppins + Inter loaded
- Skip-to-content link for accessibility

## Review Focus Areas
- Security: token management, XSS risks, CSRF, rate limiting
- Auth guard bypass vulnerabilities
- Error handling edge cases
- Accessibility (WCAG 2.2 AA compliance)
- State management (loading, empty, error states)
